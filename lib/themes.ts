// Theme registry, based on the built-in T3 Code themes. The colours for each
// theme live in app/globals.css under `[data-theme="<id>"]`.
// "light" and "dark" must exist, because next-themes resolves "system" to them.
// Every dark theme id is "dark" or ends in "-dark"; the Tailwind `dark:`
// variant in globals.css depends on that.

export type TuiTheme = {
  id: string;
  family: string;
  label: string;
  dark: boolean;
};

export const tuiThemeFamilies = [
  { id: "t3-code", label: "T3 Code", light: "light", dark: "dark" },
  {
    id: "t3-chat",
    label: "T3 Chat",
    light: "t3-chat-light",
    dark: "t3-chat-dark",
  },
  { id: "grove", label: "Grove", light: "grove-light", dark: "grove-dark" },
  { id: "ocean", label: "Ocean", light: "ocean-light", dark: "ocean-dark" },
  { id: "ember", label: "Ember", light: "ember-light", dark: "ember-dark" },
  { id: "iris", label: "Iris", light: "iris-light", dark: "iris-dark" },
] as const;

export const tuiThemes: TuiTheme[] = tuiThemeFamilies.flatMap((family) => [
  {
    id: family.light,
    family: family.id,
    label: `${family.label} Light`,
    dark: false,
  },
  {
    id: family.dark,
    family: family.id,
    label: `${family.label} Dark`,
    dark: true,
  },
]);

export const tuiThemeIds = tuiThemes.map((theme) => theme.id);

export function getThemeLabel(id: string | undefined) {
  if (!id || id === "system") {
    return "system";
  }
  return tuiThemes.find((theme) => theme.id === id)?.label ?? id;
}
