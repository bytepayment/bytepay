interface Headers {
    host: string,
    connection: string,
    'content-length': string,
    'user-agent': 'GitHub-Hookshot/b257cdf',
    accept: '*/*',
    'x-github-delivery': string,
    'x-github-event': 'issue_comment',
    // '361139620'
    'x-github-hook-id': string,
    // '489581758'
    'x-github-hook-installation-target-id': string,
    // 'repository'
    'x-github-hook-installation-target-type': string,
    'x-hub-signature': string,
    /**
     * This header is sent if the webhook is configured with a secret.
     * This is the HMAC hex digest of the request body, and is generated using the SHA-256 hash function and the as the HMAC .secretkey
     */
    'x-hub-signature-256': string,
    'content-type': 'application/json'
}
