interface Issue {
    issue: {
        id: number
        title: string
        body: string
        html_url: string
        user: GithubUser
        author_association: string,
        'number': number
    },
    comment: {
        id: number
        body: string
        created_at: string
        updated_at: string
        html_url: string
        user: GithubUser
        author_association: string
    },
    repository: {
        id: number
        name: string
        full_name: string
        owner: GithubUser
        html_url: string
    },
    /**
     * 发送人
     */
    sender: GithubUser,
    action: 'created' | 'closed' | string
}
