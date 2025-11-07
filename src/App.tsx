import { useState, useRef } from 'react';
import { Copy, Check, Code2, Sparkles } from 'lucide-react';

interface WebflowNode {
  _id: string;
  type: string;
  tag: string;
  classes: string[];
  children: any[];
  v: string;
  data: {
    search: { exclude: boolean };
    embed: {
      meta: {
        html: string;
        div: boolean;
        script: boolean;
        compilable: boolean;
        iframe: boolean;
      };
      type: string;
    };
    insideRTE: boolean;
    devlink: {
      runtimeProps: {};
      slot: string;
    };
    displayName: string;
    attr: { id: string };
    xattr: any[];
    visibility: { conditions: any[] };
  };
}

interface WebflowStyle {
  _id: string;
  fake: boolean;
  type: string;
  name: string;
  namespace: string;
  comb: string;
  styleLess: string;
  variants: {};
  children: any[];
  origin: null;
  selector: null;
}

interface WebflowPayload {
  type: string;
  payload: {
    nodes: WebflowNode[];
    styles: WebflowStyle[];
    assets: any[];
    ix1: any[];
    ix2: {
      interactions: any[];
      events: any[];
      actionLists: any[];
    };
  };
  meta: {
    droppedLinks: number;
    dynBindRemovedCount: number;
    dynListBindRemovedCount: number;
    paginationRemovedCount: number;
    universalBindingsRemovedCount: number;
    unlinkedSymbolCount: number;
    codeComponentsRemovedCount: number;
  };
}

export default function WebflowClipboardEditor() {
  const [pastedContent, setPastedContent] = useState<string>('');
  const [webflowJson, setWebflowJson] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null);

  const generateRandomId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const escapeContent = (content: string): string => {
    return content
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>): void => {
    event.preventDefault();
    const content = event.clipboardData.getData('text/plain');
    setPastedContent(content);
    generateWebflowJson(content);
  };

  const handleManualInput = (content: string): void => {
    setPastedContent(content);
    if (content.trim()) {
      generateWebflowJson(content);
    } else {
      setWebflowJson('');
    }
  };

  const generateWebflowJson = (content: string): void => {
    const nodeId = generateRandomId();
    const styleId = generateRandomId();
    const escapedContent = escapeContent(content);

    const webflowData: WebflowPayload = {
      type: "@webflow/XscpData",
      payload: {
        nodes: [
          {
            _id: nodeId,
            type: "HtmlEmbed",
            tag: "div",
            classes: [styleId],
            children: [],
            v: escapedContent,
            data: {
              search: {
                exclude: true
              },
              embed: {
                meta: {
                  html: escapedContent,
                  div: false,
                  script: true,
                  compilable: false,
                  iframe: false
                },
                type: "html"
              },
              insideRTE: false,
              devlink: {
                runtimeProps: {},
                slot: ""
              },
              displayName: "",
              attr: {
                id: ""
              },
              xattr: [],
              visibility: {
                conditions: []
              }
            }
          }
        ],
        styles: [
          {
            _id: styleId,
            fake: false,
            type: "class",
            name: "custom-embed",
            namespace: "",
            comb: "",
            styleLess: "",
            variants: {},
            children: [],
            origin: null,
            selector: null
          }
        ],
        assets: [],
        ix1: [],
        ix2: {
          interactions: [],
          events: [],
          actionLists: []
        }
      },
      meta: {
        droppedLinks: 0,
        dynBindRemovedCount: 0,
        dynListBindRemovedCount: 0,
        paginationRemovedCount: 0,
        universalBindingsRemovedCount: 0,
        unlinkedSymbolCount: 0,
        codeComponentsRemovedCount: 0
      }
    };

    setWebflowJson(JSON.stringify(webflowData, null, 2));
  };

  const handleCopyWebflow = (): void => {
    if (!webflowJson) return;

    // const parsedData = JSON.parse(webflowJson);

    function webflowCopy(e: ClipboardEvent): void {
      if (e && e.clipboardData) {
        e.clipboardData.setData('application/json', webflowJson);
        e.clipboardData.setData('@webflow/XscpData', webflowJson);
        e.clipboardData.setData('text/plain', pastedContent);
        e.preventDefault();
      }
      window.removeEventListener('copy', webflowCopy);
    }
    
    window.addEventListener('copy', webflowCopy);
    document.execCommand('copy');
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            HTML to Webflow Component
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Paste any HTML or SVG content and instantly convert it to a Webflow component
          </p>
        </div>
        
        {/* Paste Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 transition-all hover:shadow-2xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Code2 className="w-4 h-4" />
            Paste Your HTML/SVG Content
          </label>
          <textarea
            ref={pasteAreaRef}
            value={pastedContent}
            onChange={(e) => handleManualInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your HTML, SVG, or any code here (Ctrl+V or Cmd+V)..."
            className="w-full min-h-[200px] font-mono text-sm p-4 border-2 border-gray-200 rounded-xl resize-y bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
          {!pastedContent && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
              Waiting for content...
            </p>
          )}
        </div>
        
        {/* Webflow JSON Output */}
        {webflowJson && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all hover:shadow-2xl">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <h2 className="font-semibold text-white text-lg">
                    Webflow Component JSON
                  </h2>
                </div>
                <div className="text-xs text-purple-100 bg-white/20 px-3 py-1 rounded-full">
                  Ready to Copy
                </div>
              </div>
              <div className="p-5">
                <div className="relative">
                  <textarea
                    value={webflowJson}
                    onChange={(e) => setWebflowJson(e.target.value)}
                    className="w-full min-h-[300px] max-h-[500px] font-mono text-xs p-4 border-2 border-gray-200 rounded-xl resize-y bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md font-medium">
                    JSON
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {webflowJson.length.toLocaleString()} characters • Ready for Webflow
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCopyWebflow}
                className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied as Webflow Component!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Copy as Webflow Component
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Your content will be wrapped as a Webflow HTML Embed component</p>
        </div>
      </div>
    </div>
  );
}