var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/webspaceadam/sveltuir.git', // Update to point to your repository  
        user: {
            name: 'Adam Gniady', // update to use your name
            email: 'neunfuenf@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)