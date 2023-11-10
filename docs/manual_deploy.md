# Manual Deploy Guide

Currently, we deploy the services manually.

# Prerequisite

Make sure you install gh cli in your local environment.  
Here's the gh cli link: https://cli.github.com/.

# Deploy All Services

- Below command will deploy contract to the given env (prod / env) and build images of frontend and relay. It will run the containers of frontend and relay on cloud run by using the images we just published to Artifact Registry.
```bash
$ gh workflow run main-cd.yml --ref feat_system_cicd_enhancment -f build-services=contract -f version=0.1.1 -f env={prod / dev} --repo social-tw/social-tw-website
```

# Deploy Contract

- Below command will deploy contract to the given env (prod / dev)
```bash
$ gh workflow run deploy-contract.yml --ref feat_system_cicd_enhancment -f env={prod / dev} --repo social-tw/social-tw-website 
```

# Deploy Frontend

- Below command will deploy frontend service with the given version of image to the given env (prod / env)
```bash
gh workflow run deploy-frontend.yml --ref feat_system_cicd_enhancment -f version=0.1.1 -f env={prod / dev} --repo social-tw/social-tw-website
```

# Deploy Relay

- Below command will deploy relay service with the given version of image to the given env (prod / env)
```bash
gh workflow run deploy-relay.yml --ref feat_system_cicd_enhancment -f version=0.1.1 -f env={prod / dev} --repo social-tw/social-tw-website
```