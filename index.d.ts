export type StanzaInstance = {
  render: <TemplateParameters>(opts: StanzaRenderOptions<TemplateParameters>) => void;
  query: <QueryResults, QueryOptionParameters>(opts: StanzaQueryOptions<QueryOptionParameters>) => Promise<QueryResults>;
  importWebFontCSS: (url: string) => void;
  root: ShadowRoot
}

export type StanzaRenderOptions<TemplateParameters> = {
  template: string;
  parameters: TemplateParameters;
}

export type StanzaQueryOptions<QueryOptionParameters> = {
  endpoint: string;
  template: string;
  parameters?: QueryOptionParameters;
}

