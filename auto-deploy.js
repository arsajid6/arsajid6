const { execSync } = require('child_process');

console.log('Automating deployment to Vercel via GitHub...');

try {
    // Stage all changes
    console.log('Staging changes...');
    execSync('git add .', { stdio: 'inherit' });

    // Check if there are any changes to commit
    const status = execSync('git status --porcelain').toString();

    if (status.trim() === '') {
        console.log('No changes to commit. Everything is up to date.');
    } else {
        // Commit with an automated message
        console.log('Committing changes...');
        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const commitMessage = `Automated update: ${timestamp}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        // Push to GitHub triggering Vercel
        console.log('Pushing to GitHub (triggering Vercel deploy)...');
        execSync('git push', { stdio: 'inherit' });

        console.log('✅ Changes successfully pushed! Vercel will deploy them shortly.');
    }
} catch (error) {
    console.error('❌ An error occurred during the automated deployment:', error.message);
}
