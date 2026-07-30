import { getPayload } from 'payload';
import config from '../src/payload.config';

async function main() {
  const payload = await getPayload({ config });
  
  await payload.update({
    collection: 'users',
    where: { email: { equals: 'contefania3@gmail.com' } },
    data: { password: 'Fabito24play' },
    overrideAccess: true
  });
  
  console.log('Contraseña actualizada a Fabito24play');
  process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
