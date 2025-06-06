#!/usr/bin/env python3

import requests
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def trigger_workflow(request):
    """
    Cloud Function to trigger the GitHub Actions workflow.
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
    """
    # GitHub repository details
    owner = "docmarionum1"
    repo = "mtg-chaos-constructed"
    workflow_id = "build.yml"  # The name of your workflow file
    
    # GitHub API endpoint
    url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
    
    # Get token from environment variable
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        logger.error("GITHUB_TOKEN environment variable not set")
        return "Error: GITHUB_TOKEN not set", 500
    
    # Headers with authentication
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Request body
    data = {
        "ref": "main"  # The branch to run the workflow on
    }
    
    try:
        # Make the API call
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 204:
            logger.info("Workflow triggered successfully")
            return "Workflow triggered successfully", 200
        else:
            logger.error(f"Failed to trigger workflow: {response.status_code}")
            logger.error(response.text)
            return f"Failed to trigger workflow: {response.text}", response.status_code
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error making request: {e}")
        return f"Error making request: {str(e)}", 500

if __name__ == "__main__":
    trigger_workflow(None)  # For local testing 