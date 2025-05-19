export async function POST(req) {
    try {
      const { email, name = '' } = await req.json();
      const username = name.split(' ')[0].toLowerCase();
  
      const user = {
        id: Date.now(),
        username,
        email,
        name,
        roles: ['subscriber']
      };
  
      return Response.json({ user });
    } catch (err) {
      console.error('API /social-login error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }