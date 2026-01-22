# Admin Guide

## What admins do
Admins manage the platform configuration and ensure groups and members can operate smoothly.

## Key admin responsibilities
- Approve and manage members
- Create and manage groups
- Maintain system settings
- Support troubleshooting for login and data access

## Recommended admin routines
- Review new member registrations regularly
- Verify group leadership roles are correctly assigned
- Monitor announcements and reported issues
- Ensure database backups and hosting environment variables are managed properly

## Group leadership roles
Some actions in the member portal depend on group leadership roles.
Admins should ensure leadership roles are assigned correctly so:
- Proposals can be created
- Group-level management actions are available

## Group decisions (Proposals + Voting)
- Leadership can create proposals
- Members can vote
- Admins should ensure groups understand the process and follow consistent decision standards

## Group wallet (MVP)
If enabled/used, admins should understand:
- Each group may have a single wallet
- Members can view balances and recent transfers
- Leadership manages outgoing transfers via a multi-approval workflow

Admins should confirm:
- Wallet/provider environment variables are configured in the deployment environment
- The group understands who can propose/approve/execute transfers

## Troubleshooting checklist
- Login issues:
  - Verify `DATABASE_URL` and `JWT_SECRET` are configured in the deployment environment
- Missing data:
  - Confirm the database schema is up to date
  - Confirm user is in the group and role is correct

