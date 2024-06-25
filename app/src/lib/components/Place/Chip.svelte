<script lang="ts">
  import Chip, { LeadingIcon, Text } from '@smui/chips';

  /** 名前 */
  export let name: string;
  /** アイコン */
  export let icon: string;
  /** テキスト */
  export let text: string;
  /** スタイル */
  export let style: string;
</script>

<div>
  <Chip chip={name} {style}>
    <LeadingIcon class="material-icons" aria-hidden="true">{icon}</LeadingIcon>
    <Text><span class="icon-label">{name}</span>{text}</Text>
  </Chip>
</div>

<style>
  * :global(.mdc-chip) {
    background-color: var(--md-theme-surface-variant);
    color: var(--md-theme-on-surface-variant);
    border: thin solid var(--md-theme-on-surface-variant);
  }
  * :global(.mdc-chip__icon--leading) {
    color: var(--md-theme-on-surface-variant);
  }
  .icon-label {
    display: none;
  }
</style>
