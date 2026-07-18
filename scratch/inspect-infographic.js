import { execSync } from 'child_process';
const key = `"C:\\Users\\yo\\Pictures\\Descargaspc\\antigravityOLD\\aether\\02_DATOS\\OPENCLAW_HUB\\id_rsa_openclaw.key"`;
const sshCmd = `ssh.exe -i ${key} -o StrictHostKeyChecking=no ubuntu@143.47.35.167 "sqlite3 /home/ubuntu/workspace/projects/matiza/data/matiza.db \\"SELECT id, slug, infographic_svg IS NOT NULL, status FROM articles WHERE id = 'art-1784108546896-819';\\""`;
try {
  const stdout = execSync(sshCmd, { encoding: 'utf8' });
  console.log(stdout);
} catch (e) {
  console.error("Error:", e.message);
}
