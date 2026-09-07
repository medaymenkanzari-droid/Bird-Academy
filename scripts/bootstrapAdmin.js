/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN / LMSE ENTERPRISE — BOOTSTRAP DU PREMIER SUPER ADMIN
 * Commande sécurisée d'initialisation du premier compte propriétaire Super Admin.
 */

import readline from 'node:readline';
import { AdminUserRepository } from '../src/server/repositories/AdminUserRepository';
import { PasswordCrypto } from '../src/server/utils/passwordCrypto';

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (const arg of args) {
    if (arg.startsWith('--email=')) params.email = arg.split('=')[1];
    if (arg.startsWith('--name=')) params.name = arg.split('=')[1];
    if (arg.startsWith('--password=')) params.password = arg.split('=')[1];
    if (arg.startsWith('--confirm=')) params.confirm = arg.split('=')[1];
  }
  return params;
}

function promptInteractive(questionText, isPassword = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (isPassword && process.stdin.isTTY) {
      process.stdout.write(questionText);
      let pwd = '';
      const onData = (char) => {
        char = char.toString();
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.removeListener('data', onData);
            process.stdin.setRawMode(false);
            rl.close();
            console.log('');
            resolve(pwd);
            break;
          case '\u0003': // Ctrl+C
            process.exit(1);
            break;
          case '\u007f': // Backspace
          case '\b':
            if (pwd.length > 0) {
              pwd = pwd.slice(0, -1);
            }
            break;
          default:
            pwd += char;
            break;
        }
      };
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', onData);
    } else {
      rl.question(questionText, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function runBootstrap() {
  console.log('==================================================');
  console.log(' BIRD ACADEMY ADMIN — INITIALISATION SUPER ADMIN ');
  console.log('==================================================');

  const repo = AdminUserRepository.getInstance();

  // 1. Audit Check: Verify if a Super Admin already exists
  if (repo.hasSuperAdmin()) {
    console.error('\n❌ ERREUR SÉCURITÉ : Un compte Super Admin existe déjà dans le système.');
    console.error('La création d un second Super Admin via la commande bootstrap est strictement REFUSÉE.');
    process.exit(1);
  }

  const cliParams = parseArgs();

  let email = cliParams.email;
  let name = cliParams.name;
  let password = cliParams.password;
  let confirm = cliParams.confirm;

  // If parameters were not passed via CLI, prompt interactively
  if (!email) {
    email = await promptInteractive('Entrez l email du Super Admin propriétaire : ');
  }

  if (!name) {
    name = await promptInteractive('Entrez le nom d affichage du Super Admin : ');
  }

  if (!password) {
    password = await promptInteractive('Entrez le mot de passe Super Admin (8+ caractères) : ', true);
  }

  if (!confirm && !cliParams.password) {
    confirm = await promptInteractive('Confirmez le mot de passe Super Admin : ', true);
  } else if (!confirm) {
    confirm = password;
  }

  // 2. Validations
  if (!email || !email.includes('@')) {
    console.error('\n❌ ERREUR : Adresse email administrateur invalide.');
    process.exit(1);
  }

  if (!name || name.trim().length === 0) {
    console.error('\n❌ ERREUR : Le nom d affichage est obligatoire.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('\n❌ ERREUR : Le mot de passe doit comporter au moins 8 caractères.');
    process.exit(1);
  }

  if (password !== confirm) {
    console.error('\n❌ ERREUR : Le mot de passe et sa confirmation ne correspondent pas.');
    process.exit(1);
  }

  // 3. Execution
  try {
    const superAdmin = repo.createSuperAdmin({
      email,
      name,
      password,
    });

    console.log('\n==================================================');
    console.log(' ✅ PREMIER COMPTE SUPER ADMIN CRÉÉ AVEC SUCCÈS ! ');
    console.log('==================================================');
    console.log(` Identifiant  : ${superAdmin.id}`);
    console.log(` Nom Affiché  : ${superAdmin.name}`);
    console.log(` Email Admin  : ${superAdmin.email}`);
    console.log(` Rôle         : ${superAdmin.role} (Super Administrateur)`);
    console.log(` Statut       : ${superAdmin.status.toUpperCase()}`);
    console.log(` Créé le      : ${superAdmin.createdAt}`);
    console.log('--------------------------------------------------');
    console.log(' MOT DE PASSE : Haché en mode sécurisé scrypt + Salt.');
    console.log(' (Aucun mot de passe en clair stocké ou journalisé).');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ ÉCHEC DU BOOTSTRAP :', err.message);
    process.exit(1);
  }
}

runBootstrap();
