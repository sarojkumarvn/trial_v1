export default function localPath(value?: string) {
  if (!value?.startsWith("/")) return undefined;
  const url = new URL(value, window.location.origin);
  return url.origin === window.location.origin ? url.href : undefined;
}
