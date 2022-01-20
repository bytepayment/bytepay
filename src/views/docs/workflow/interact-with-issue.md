# Interact With Github Issue Comment

## 1. Create A Task

1) First at all, you need create a issue, give it a title, and describe the task detail.
2) Then comment in specfied format like below:

```bash
Dotpay: /pay number DOT # eg. Dotpay: /pay 10 DOT
```

3) After that, if following conditions are met, we would create a task.
  - You are owner of the repository
  - Your account balance is beyond than the number you want pay
  - This issue has not been created task

## 2. Apply A Task

1) After the author publishes the task, the developer can apply for the task.
2) Comment in specified format like below:

```bash
Dotpay: /apply task
```
3) If no other developer applied this task, then we would assign this task to developer who
comment in above format

## 3. Finsh A Task
```bash
Dotpay: /finish task
```

## 4. Pay For A Task
```bash
Dotpay: /paid task
```

## 5. Bind Address
```bash
Dotpay: /bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE
```