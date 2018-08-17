# pdns-auth-proxy
When you enable the API for PowerDNS there is just one `api-key`. With this one key you can control all data. But what if you would like to delegate control over certain zones to other teams? This is where **pdns-auth-proxy** comes into play. **pdns-auth-proxy** is a proxy solution to put in front of the pdns api and will let you configure which `api-key` can modify what `zone`.

## Architecture
`pdns-auth-proxy` is a very light weight http proxy written in NodeJs (event-driven and nonblocking I/O). It can run on any server, as long as it can reach the http endpoint of your pdns server. However, since it is so light weight usually it is installed on the same server as where pdns already runs.

## Installation
This procedure assumes you are installing on the same server as where pdns already runs.

```bash
export INSTALL_DIR=/set/to/your/dir/of/choice
cd $INSTALL_DIR

#Get the code
git clone https://github.com/prolane/pdns-auth-proxy.git
cd pdns-auth-proxy

#Install pdns-auth-proxy node dependencies
npm install
```

## Configuration
Edit the file `$INSTALL_DIR/pdns-auth-proxy/config.json`
- `backend`: Set this to the pdns api endpoint. (e.g. `http://localhost:8080`)
- `XApiKey`: Set this to the value set for the option `api-key` in your `pdns.conf`
- `proxyPort`: This is the port number which `pdns-auth-proxy` will be using to run on. The default port is `8001` because this is the default api port number for pdns. This way the API port number stays the same for API users.
- `keys`: This is a *dict* which should contain key/value pairs. The `key` is the secret key which API users will be sending as a `X-API-Key` header in their API requests. The `value` should be the zone name. This creates the extra authorization layer where a certain key is only allowed to modify the configured zone.

The configuration of `pdns` should be changed because of two things:
- Make sure the actual pdns api can only be reached from the localhost. You want people to go over the proxy!
- Make sure the pdns api is not running on port 8001 as well.

```bash
# Usually in /etc/powerdns.pdns.conf
# Change these settings:
webserver-port=8080
webserver-address=127.0.0.1

# When done, restart pdns
systemctl restart pdns
```

## Start using pdns-auth-proxy
On the pdns server start the proxy
```bash
node $INSTALL_DIR/pdns-auth-proxy/proxy.js
```

You can now use the pdns API exaclty the same way you were used to (as described in the pdns docs). For example, to GET the zone data:
```
curl -s -H 'X-API-Key: myapikey' http://10.1.2.3:8001/api/v1/servers/localhost/zones/test.com
```

## Limitations
- Only for PowerDNS Authoritative Nameserver
- Only API request for resource path `/api/*/servers/*/zones/<zone-name>` is supported. All HTTP methods on this resource path will be send to pdns. See also the [pdns documentation](https://doc.powerdns.com/authoritative/http-api/zone.html).
- Currently one `key` can control only one `zone`. There can be different (unique) keys all controlling the same `zone` though.

