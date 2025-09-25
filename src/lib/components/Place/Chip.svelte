<script lang="ts">

  /** 名前 */
  export let name: string;
  /** アイコン */
  export let icon: string;
  /** テキスト */
  export let text: string;
  /** スタイル */
  export let style: string;
</script>

<div class="badge badge-primary badge-sm border-[thin] border-solid" {style}>
  <span class="size-[1em] material-symbols-outlined" aria-hidden="true">{icon}</span>
  <span class="hidden">{name}</span>{text}
</div>
