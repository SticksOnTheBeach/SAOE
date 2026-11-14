declare namespace React.JSX {
  interface IntrinsicElements {
    'smart-drop-down-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'selection-mode'?: string;
      placeholder?: string;
      [key: string]: any;
    }, HTMLElement>;
    'smart-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: string;
      selected?: boolean;
      [key: string]: any;
    }, HTMLElement>;
  }
}
