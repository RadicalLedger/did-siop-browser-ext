# did-siop #

## How to build ##
* Run ```npm install``` in project root to install dependencies.
* Run ```ng build --prod``` in project root. This will generate the compiled code in ***dist*** folder.

## Overview ##
This implements _Self Issued OpenId Connect Provider (SIOP)_ for _Decentralized Identities (DIDs)_. This is implemented  as a browser add-on and allows to integrate _Identity Wallets_ with _Relying Parties_ which uses OpenIDConnect Clients (OIDC Clients) complies the SIOP specification.

Following are the primary specifications followed by this implementation.

| Specification | Version |
| ------------- | --------|
| [OpenID Connect Core 1.0 incorporating errata set 1](https://openid.net/specs/openid-connect-core-1_0.html#SelfIssued) | Final v1.0 |
| [Self-Issued OpenID Provider](https://openid.net/specs/openid-connect-self-issued-v2-1_0.html) | v2.0 |
| | |

**NOTE:** This extension is compliant with manifest version 2. There was an effort to port this to manifest version 3 but it did not materialize due to the following reasons 
- In manifest version 3, background pages are replaced with service workers. Service Works' execution context is NOT the [Window](https://developer.mozilla.org/docs/Web/API/Window) and hence has NO access to the DOM and certain aother resources ([more info](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#workers))
- [did-siop](https://github.com/RadicalLedger/did-siop-lib/tree/dev) heavily use cryptographic related libraries which are designed to operate on the execution context of Window
- Porting did-siop to use a set of cryptograhic libraries which are not relying on the execution environment of Window is a considerable development and does not have the right priority yet
- Developer believes compliance with Manifest v3 as a necessary improvement, but it is not included in the platform roadmap yet

### Background ###
Even though the OIDC specifications have defined protocols to to be independent of any single or few authorization providers, currently day millions of people rely on Social Login schemes provided by companies such as Google and Facebook. DID-SIOP brings the authorization provider service under the control of true owner of the identity and its meta data. In other words, DID-SIOP replace Social Login Schemes with a software module run out of his/her browser (as an add-on) or smart phone application. Significance of this is that, identification and personal data will be under the full control of the owner of the data and will prevent unauthorized use of such data by any other party.

### Goals ###
* Being compatible with existing OIDC Clients and OIDC Providers which implements SIOP specification
* Adding validation rules for OIDC clients that have DID AuthN support to make full use of DIDs.
* Not rely on any intermediaries (private or public OPs)

### Protocol Flow ###
* User click on a button on RP Application to login to RP using DID SIOP
* This initiate a redirection to DID SIOP (in this case the browser extension) (_openid://<SIOP Request>_)
* The DID SIOP generate a response _*<SIOP Response>*_ based on the DID Method it supports.
* RP receives an id_token 


## See in Action ##
Follow the steps below to see the DID-SIOP in action.

- Download the Extension from [this link](https://drive.google.com/drive/folders/1vTUBK9G9A5rmZ_-ZojALi_j0oXoIqjgQ?usp=sharing). Works on Chrome, Firefox and Microsoft Edge
- Manually install the downloaded extension to your browser.
  * [Chrome](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/).
  * [Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).
  * [Edge](https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/adding-and-removing-extensions).
- Click on the extension/add-on icon to see the default attributes available for testing. Just use defaults or create/ use your own Decentralised Identity (DID) attributes to test the app.
- Browse into sample Relying Party app [http://rp.didsiop.org](http://rp.didsiop.org/)
- Click on "DID SIOP Login" button to start the authorization process
- You will be asked for the confirmation to Sign in using DID-SIOP.
- Upon acceptance you will navigate to the secure area of the app and you will see the DID used for the authorization.

## Current Status ##
### Features Implemented ###
* Generate SIOP request using client library
  * Supports both request and request_uri query parameters
  * Request JWT signing supports RS256, RS384, RS512, PS256, PS384, PS512, ES256, ES384, ES512, ES256K, ES256K-R, EdDSA algorithms.
* Capture, verify and validate SIOP request using chrome extension.
  * Extension uses either authentication section from RP DID Document or jwks/jwks_uri from registration (rp meta data) section in request JWT to verify the request JWT.
* Get End User confirmation.
* Generate and send SIOP id_token response based on End User DID using chrome extension.
  * id_token is returned as a URL fragment (hash parameter) to the redirect_uri via the user agent (browser).
* Verify id_token using client library.
  * Library uses either authentication section of End User DID document or sub_jwk in the id_token to verify the id_token.
* Set End User DID and id token signing parameters in the extension.

### Features NOT Implemented ###
* id_token encryption.
* Handling optional request parameters.

## Development Roadmap ##
- Implement features marked as OPTIONAL in the [DID-SIOP Spec](https://identity.foundation/did-siop/)
- Convert DID-SIOP core functionality to a npm package
- Build an iOS app
- Build an Android app

## How to integrate ##

### Steps
* Use ***did-siop relying party library*** from ***https://cdn.jsdelivr.net/npm/did-siop@1.4.4/dist/browser/did-siop.min.js*** or via npm ***https://www.npmjs.com/package/did-siop*** to communicate with the Chrome extension.
  * Include the library in any html page using script tag or in any Node.js based web project via npm.
  * Create new instance using ***const siop_rp = new DID_SIOP.RP.getRP(rp_redirect_uri, rp_did, rp_meta_data_object)***.
  * Set signing parameters ***siop_rp.addSigningParams(rp_private_key)***.
  * Generate request ***siop_rp.generateRequest().then(request => {}).catch(err => {})***.
  * The generated request needed to be added as the value for attribute named ***data-did-siop*** of the desired HTML element. This attribute value is required for the content_script of the extension to bind necessary events.
      * Example: - 
      ```html 
        <button data-did-siop="request">DID SIOP Login </button>
      ```
  * Ideal use case is to use a pre-generated request.
  * If the event binding is successful, clicking on the element will initiate the login flow and ask for the confirmation.
  * Upon confirmation, extension will open a new page with the url provided as ***rp_redirect_uri*** with the response JWT as a fragment.
  * To validate, capture the response fragment in the callback page and use ***siop_rp.validateResponse(response).then(decodedJWT => {}).catch(err => {})*** to validate the response.


### Code snippets
Functioning project based on code snippets below could be found at [did-siop-rp-web-min](https://github.com/RadicalLedger/did-siop-rp-web-min).
#### index.html
Public page where user could request to login to the relying party app
```html
    <button id="did-siop-login" data-did-siop="pre-generated-request">DID SIOP Login</button>
    <script>
    
        document.addEventListener('DOMContentLoaded', async function() {
            getRequestObject();
            }, false);    

        var siop_rp = null;

        function getRequestObject() {
            console.log("getRequestObject");
            var xhr = new XMLHttpRequest();
            var url = "/get_request_object";
            xhr.open("GET", url, true);

            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            xhr.onreadystatechange = function() { // Call a function when the state changes.
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Request finished. Do processing here.
                    var bodyObj = JSON.parse(xhr.responseText);
                    console.log(bodyObj);
                    document.getElementById("did-siop-login").setAttribute("data-did-siop", bodyObj.reqObj);                    
                }
                else {
                    console.log("Error in Data Submission - Status", this.status );
                }
            }
            xhr.send(null);
        }
    </script>
```

On server side, generate the request object using Relying Party DID and Private Key
```js
const DID_SIOP = require('did-siop');

async function getRequestObject(req, res, next) {
    console.log("getRequestObject Invoked");
    var requestObject;
    requestObject = await generateRequestObject();
    res.send(JSON.stringify({'reqObj':requestObject}));
}

async function generateRequestObject(){
    console.log('startProcess');
    var request;
    
    siop_rp = await DID_SIOP.RP.getRP(
        'localhost:5001/home', // RP's redirect_uri
        'did:ethr:0xA51E8281c201cd6Ed488C3701882A44B1871DAd6', // RP's did
        {
            "jwks_uri": "https://uniresolver.io/1.0/identifiers/did:example:0xab;transform-keys=jwks",
            "id_token_signed_response_alg": ["ES256K-R", "EdDSA", "RS256"]
        }
    )
    console.log('Got RP instance ....');
    siop_rp.addSigningParams('8329a21d9ce86fa08e75354469fb8d78834f126415d5b00eef55c2f587f3abca'); // Add private key

    console.log('RP SigningParams added ...');
    request = await siop_rp.generateRequest();

    console.log('Request generated ...', request);
    return request;
}
```
#### home.html
User has been authenticated and authorised to access the restricted area of the application. Below how how to validate the response received as a JWT.
```html
<p id='responseView'></p>

<script src="https://cdn.jsdelivr.net/npm/did-siop@1.3.0/dist/browser/did-siop.min.js"></script>
<script>
  let response = window.location.href.split('#')[1];
  
  const rp = await DID_SIOP.RP.getRP(
    'localhost:8080/home.html', // RP's redirect_uri
    'did:ethr:0xB07Ead9717b44B6cF439c474362b9B0877CBBF83', // RP's did
    {
      "jwks_uri": "https://uniresolver.io/1.0/identifiers/did:example:0xab;transform-keys=jwks",
      "id_token_signed_response_alg": ["ES256K-R", "EdDSA", "RS256"]
    } // RP's registration meta data
  );
  
  rp.validateResponse(response).then(function(decoded){
    document.getElementById('responseView').innerHTML = JSON.stringify(decoded);
  })
  .catch(function(err){
    document.getElementById('responseView').innerHTML = JSON.stringify(err);
  });

</script>
```
You could find a working solution with minimum dependencies which could run on your local machine [here](https://github.com/RadicalLedger/did-siop-rp-web-min). You should have the browser extension installed for this sample to work.
