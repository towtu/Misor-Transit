import prisma from './prisma';

export async function getUser(request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireAuth(request) {
  const user = await getUser(request);
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireStaff(request) {
  const user = await requireAuth(request);
  if (!['STAFF', 'ADMIN'].includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}
