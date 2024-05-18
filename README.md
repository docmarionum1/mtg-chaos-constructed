# Magic The Gathering Chaos Constructed Creator

## Development

```bash
nvm use 16
npm run dev -- --host
```

### Setup WSL to test from another device

Create a port forwarding rule:

```powershell
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=(wsl hostname -I)
```

You can verify this worked with `netsh interface portproxy show all`. It will
show an entry like:

`0.0.0.0         5173        172.18.X.X  5173`

Now you can access the site from another device using the host computer's LAN
address, i.e. `192.168.X.X`.

Reference: https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan
