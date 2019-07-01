// env variables
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, API_VERSION, TUNNEL_URL } = require('./env.json');

/**
 * Dependencies
 */
require('isomorphic-fetch');
const ip = require('ip');
const Koa = require('koa');
const  bodyParser = require('koa-bodyparser');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const Router = require('koa-router');
const fs = require('fs');

const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

function fetchOptions(ctx) {
  return {
    credentials: 'include',
    headers: {
      'X-Shopify-Access-Token': ctx.session.accessToken,
      'Content-Type': 'application/json',
    },
  };
}

async function GET_script_tags(ctx) {
  const endpoint = `https://${ctx.session.shop}/admin/api/${API_VERSION}/script_tags.json`;
  const response = await fetch(endpoint, fetchOptions(ctx));
  const text = await response.text();
  return ctx.body = text;
}

async function POST_script_tags(ctx) {
  const json = JSON.stringify({
    script_tag: {
      event: 'onload',
      src: `${TUNNEL_URL}/static/a.js`
    }
  });
  
  const endpoint = `https://${ctx.session.shop}/admin/api/${API_VERSION}/script_tags.json`;
  const response = await fetch(endpoint, {
    ...fetchOptions(ctx),
    method: 'POST',
    body: json,
  });
  
  const text = await response.text();
  return ctx.body = text;
}

async function DELETE_script_tags(ctx) {
  const { id } = ctx.params;
  if (!id) {
    ctx.statusCode = 400;
    return ctx.body = 'Invalid Request';
  }

  const endpoint = `https://${ctx.session.shop}/admin/api/${API_VERSION}/script_tags/${id}.json`;
  const response = await fetch(endpoint, {
    ...fetchOptions(ctx),
    method: 'DELETE',
  });
  
  if (response.ok) {
    return ctx.body = { success: true };
  }
  return ctx.body = { success: false };
}

/**
 * Serve static files
 * @param {*} path 
 * @param {*} ctx 
 */
async function static(path, ctx) {
  await fsp.readFile()
}

app.prepare().then(() => {

  // Start Server/Router
  const server = new Koa();
  const router = new Router();

  router.get('/script_tags/delete/:id', DELETE_script_tags)

  // Authentication
  server.keys = [SHOPIFY_API_SECRET_KEY];
  server.use(session(server));
  server.use(bodyParser());
  server.use(router.routes());
  server.use(require('koa-static')(__dirname + '/static'));
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        'read_products', 'write_products',
        'read_themes', 'write_themes',
        'read_script_tags', 'write_script_tags',
        'read_price_rules', 'write_price_rules',
        'read_checkouts', 'write_checkouts',
        'read_inventory', 'write_inventory',
        'read_orders', 'write_orders',
      ],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set('shopOrigin', shop, { httpOnly: false });
        ctx.redirect('/');
      },
    }),
  );
  server.use(graphQLProxy({version: ApiVersion.April19}))
  server.use(verifyRequest());
  server.use(async (ctx) => {

    // This switch is functioning as a rudimentary router
    switch(ctx.url) {
      case '/get-scripts': return GET_script_tags(ctx);
      case '/post-scripts': return POST_script_tags(ctx);
      default:
        // Views
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});