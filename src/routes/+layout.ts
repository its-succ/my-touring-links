/** @type {import('./$types').LayoutLoad} */

export async function load({ url, data }) {
  return {
    ...data,
    url: url.pathname
  };
}
