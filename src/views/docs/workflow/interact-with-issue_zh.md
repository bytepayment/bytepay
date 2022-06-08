# 与 Github 问题评论互动

## 1. 创建任务

1) 首先，您需要创建一个问题，给它一个标题，并描述任务细节。
2) 然后以指定的格式进行评论，如下所示：

```bash
# 例如: 
# /bytepay task 1.01 NEAR
# /bytepay task 10 DOT
/bytepay task <金额> <货币单位>
```

3) 之后，如果满足以下条件，我们将创建一个任务。

- 您是存储库的所有者
- 您的帐户余额超出了您要支付的金额
- 此问题尚未创建任务

## 2. 应用任务

1) 作者发布任务后，开发者即可申请任务。
2) 以指定格式评论如下：

```bash
/bytepay apply
```

3) 如果没有其他开发人员应用此任务，那么我们会将此任务分配给开发人员
   以上述格式发表评论

## 4. 为任务付费

```bash
/bytepay pay
# 或
/bytepay pay <Github用户名> <金额> <货币单位>
```

## 5. 绑定地址

```bash
# 例如:
# /bytepay bind near xxxxxxxx.near.org
# /bytepay bind acala xxxxxx
/bytepay bind <账号类型> <账号地址>
```
