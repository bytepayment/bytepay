const request = require('./request')

async function getToken() {
  const r = await request.post('get_token_for_test')
  return r.data
}
module.exports = {
  getToken,
  test_user_id: 37979965,
  test_dev_id: 23449728,
  test_user_login: 'sulnong',
  test_repo_name: 'DotpayTest',
  test_repo_id: 138711724,
  test_user_polka_address: '5GbNZj4ntEt25oMrZTfpXHfwVQhvJmb8vBX33mj7L7v7P3EK',
  test_recv_address: '5FU6HZLVj74hF1sBxAFQ7PkS6HQbVF3gAFDLPLV37YFNKNjV',
  test_bind_own_address: '5FU6HZLVj74hF1sBxAFQ7PkS6HQbVF3gAFDLPLV37YFNKNjV',
}
