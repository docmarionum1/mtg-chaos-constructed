#!/usr/bin/env python3

import subprocess
import os
import json
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_command(command):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e.stderr}")
        raise

def deploy_function():
    """Deploy the trigger_workflow function to GCP Cloud Functions."""
    # Get the absolute path to the trigger_workflow.py script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Deploy the function
    deploy_cmd = f"""gcloud functions deploy trigger-mtg-chaos-workflow \
        --gen2 \
        --runtime=python311 \
        --region=us-central1 \
        --source={script_dir} \
        --entry-point=trigger_workflow \
        --trigger-http \
        --set-env-vars=GITHUB_TOKEN={os.environ.get('GITHUB_TOKEN')} \
        --memory=128MiB \
        --timeout=60s"""

    logger.info("Deploying Cloud Function...")
    run_command(deploy_cmd)

def get_function_url():
    """Get the URL of the existing cloud function."""
    get_url_cmd = "gcloud functions describe trigger-mtg-chaos-workflow --gen2 --region=us-central1 --format='value(url)'"
    try:
        logger.info("Fetching function URL...")
        function_url = run_command(get_url_cmd).strip()
        if not function_url:
            logger.error("Function URL is empty. Make sure the function is deployed and accessible.")
            raise ValueError("Empty function URL received")
        logger.info(f"Successfully retrieved function URL: {function_url}")
        return function_url
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to get function URL: {e.stderr}")
        raise

def create_scheduler_job(function_url, service_account):
    """Create a Cloud Scheduler job to trigger the function."""
    # Create the scheduler job
    scheduler_cmd = f"""gcloud scheduler jobs create http trigger-mtg-chaos-workflow-job \
        --schedule="47 3 * * THU" \
        --uri="{function_url}" \
        --http-method=POST \
        --time-zone="UTC" \
        --attempt-deadline=60s\
        --oidc-service-account-email="{service_account}"
        """

    logger.info("Creating Cloud Scheduler job...")
    run_command(scheduler_cmd)

def main():
    parser = argparse.ArgumentParser(description='Deploy cloud function and/or create scheduler job')
    parser.add_argument('--deploy-function', action='store_true', help='Deploy the cloud function')
    parser.add_argument('--create-scheduler', action='store_true', help='Create the scheduler job')
    parser.add_argument('--service-account', help='Service account to use for the scheduler job')
    args = parser.parse_args()

    try:
        # Check if GITHUB_TOKEN is set if deploying function
        if args.deploy_function and not os.environ.get('GITHUB_TOKEN'):
            logger.error("GITHUB_TOKEN environment variable not set")
            return
        
        if args.deploy_function:
            deploy_function()
        
        if args.create_scheduler:
            function_url = get_function_url()
            create_scheduler_job(function_url, args.service_account)
        
        logger.info("Operation completed successfully!")
        
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        raise

if __name__ == "__main__":
    main() 