# System Overview

# Overview Diagram

[login flow](https://drive.google.com/file/d/1gP4fVwX9vjOVqCKJ2XYUMBYEn0ngH0cG/view?usp=sharing)

## UserService Status Code

We modified Unirep contract to store hashedUser ID in Social TW project
The purpose

1. loginStatus = INIT: User has been initialize, then process sign up
2. loginStatus = REGISTERED: User has been signUp with own wallet
3. loginStatus = REGISTERED_SERVER: User has been signUp with server wallet. In this case, signMsg will be included

NOTINIT 0
after login to twitter
NOTINIT to INIT in `/api/user`
INIT in Unirep contract
INIT 1
