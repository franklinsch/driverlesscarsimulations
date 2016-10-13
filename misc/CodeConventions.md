# Conventions
## Some conventions for when working on this project

1. Branch naming

Every branch should be named in snake_case.

2. Commit messages

Use the imperative tense when writing git commits, and uppercase the first word.

Eg.
``
  Implement foo
``

3. Rebasing

Whenever master is updated, rebase the branch you are working on off of master.

``
  git rebase master
``

4. Pull Requests

When you are finished working on your branch, create a Pull Request on GitHub.
Someone else will have to review the branch and the CircleCI tests must pass before merging can occur.

5. Kanban

In `Analysis`, one person may have two tasks at most.
In `Development`, person can only have one task, excluding shared tasks.

6. Tasks past Backlog

A task that has moved out of Backlog must have at least one assignee.

7. Tasks put into Rejected

Tasks put into Rejected must have a comment explaining the reason for the rejection.
