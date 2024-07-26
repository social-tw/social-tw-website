# Relay: Check-in

This document describes the check-in process in the Relay.

## Check-in Process

1. Generate a Reputation Proof to prove that the user has negative reputation.

2. Generate an Epoch Key Lite Proof to prove that the user holds an epoch key.

## Test

In the current test, we evaluate the check-in process with the following cases:

1. User should be able to check in if they have negative reputation and hold an epoch key.

2. User should not be able to check in if they have positive reputation.

3. System should prevent users from claiming multiple times in a single day.

## Todo

- [ ] Add new circuit to check if two epoch keys come from the same user and prevent users from claiming multiple times in a single day.
