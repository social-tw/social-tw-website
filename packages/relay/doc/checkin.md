# Relay: Checkin

This document describes the checkin process for the Relay project.

## Checkin Process

1. Generate Reputation Proof to prove that the user has negative reputation.

2. Generate a Epoch Key Lite Proof to prove that the user do hold a epoch key.  

## Test

In the current test, we test the checkin process with the cases:

1. Should be able to checkin if the user has negative reputation and holds a epoch key.

2. Should not be able to checkin if the user has positive reputation.

3. Should prevent user from claiming multiple times in a single day

## Todo

- [ ] Add new circuit to check if two epoch key comes from the same user and prevent user from claiming multiple times in a single day.
