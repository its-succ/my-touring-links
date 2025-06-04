/** @type {import('./$types').LayoutLoad} */

export const prerender = true;

export async function load({ url }) {
  function getAuthUser(): Promise</** User */ object | false> {
    // TODO: auth.js ベースでユーザー情報を返却するようにする
    // 現時点は仮でログインしていないこととして false を戻す
    return Promise.resolve(false)
  }

  return {
    getAuthUser,
    url: url.pathname
  };
}
