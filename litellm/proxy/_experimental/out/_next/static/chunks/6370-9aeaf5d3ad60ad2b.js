"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6370],{13892:(e,t,a)=>{a.d(t,{SQ:()=>g,_2:()=>x,mB:()=>h,rI:()=>p,ty:()=>u});var s=a(31214);a(4990);var i=a(2604),l=a(290),r=a(66173),n=a(77593),o=a(73245),d=a(9363),c=a(79078),m=a(5819);function p({...e}){return(0,s.jsx)(i.i,{"data-slot":"dropdown-menu",...e})}function u({...e}){return(0,s.jsx)(l.c,{"data-slot":"dropdown-menu-trigger",...e})}function g({align:e="start",alignOffset:t=0,side:a="bottom",sideOffset:i=4,className:l,...d}){return(0,s.jsx)(r.g,{children:(0,s.jsx)(n.y,{className:"isolate z-50 outline-none",align:e,alignOffset:t,side:a,sideOffset:i,children:(0,s.jsx)(o._,{"data-slot":"dropdown-menu-content",className:(0,m.cn)("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",l),...d})})})}function x({className:e,inset:t,variant:a="default",...i}){return(0,s.jsx)(d.D,{"data-slot":"dropdown-menu-item","data-inset":t,"data-variant":a,className:(0,m.cn)("group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",e),...i})}function h({className:e,...t}){return(0,s.jsx)(c.w,{"data-slot":"dropdown-menu-separator",className:(0,m.cn)("-mx-1 my-1 h-px bg-border",e),...t})}},16084:(e,t,a)=>{a.d(t,{A:()=>N});var s=a(31214),i=a(4990),l=a(68760),r=a(44846),n=a(27200),o=a(7985),d=a(8834),c=a(66756),m=a(81255),p=a(90074),u=a(73059),g=a(36968),x=a(20148),h=a(95099),b=a(13892),f=a(5819),_=a(41322);function j({skill:e,onSkillClick:t,t:a}){return(0,s.jsxs)(b.rI,{children:[(0,s.jsx)(b.ty,{"aria-label":a("publicHub.table.openSkillActions"),"data-testid":`skill-hub-actions-${e.id}`,className:(0,f.cn)((0,h.r)({variant:"ghost",size:"icon-sm"}),"text-muted-foreground"),children:(0,s.jsx)(c.A,{className:"size-4"})}),(0,s.jsxs)(b.SQ,{align:"end",className:"w-52",children:[(0,s.jsxs)(b._2,{"data-testid":"skill-hub-action-details",onClick:()=>t(e),children:[(0,s.jsx)(m.A,{}),a("publicHub.table.viewDetails")]}),(0,s.jsxs)(b._2,{"data-testid":"skill-hub-action-copy",onClick:()=>void(0,_.lW)(e.name,a("publicHub.table.skillNameCopied")),children:[(0,s.jsx)(p.A,{}),a("publicHub.table.copySkillName")]})]})]})}var y=a(38869),v=a(18348);function A({filtered:e,t}){return(0,s.jsxs)("div",{className:"flex flex-col items-center gap-1 py-6",children:[(0,s.jsx)("div",{className:"mb-1 flex size-10 items-center justify-center rounded-lg bg-muted",children:(0,s.jsx)(o.A,{className:"size-5 text-muted-foreground"})}),(0,s.jsx)("div",{className:"text-sm font-medium text-foreground",children:t(e?"publicHub.skillsDashboard.noMatching":"publicHub.skillsDashboard.noSkills")}),(0,s.jsx)("div",{className:"text-sm text-muted-foreground",children:t(e?"publicHub.skillsDashboard.adjustFilters":"publicHub.skillsDashboard.skillsWillAppear")})]})}let N=({skills:e,isLoading:t,isAdmin:a,accessToken:o,publicPage:c=!1,onPublishSuccess:m})=>{let{t:p}=(0,v.Bd)("common"),[h,b]=(0,i.useState)(""),[f,_]=(0,i.useState)(void 0),[N,w]=(0,i.useState)(null),[k,E]=(0,i.useState)([{id:"name",desc:!1}]),S=e.length,C=(0,i.useMemo)(()=>[...new Set(e.map(e=>e.domain).filter(Boolean))],[e]),I=(0,i.useMemo)(()=>[...new Set(e.map(e=>e.namespace).filter(Boolean))],[e]),H=(0,i.useMemo)(()=>{let t=e;if(f&&(t=t.filter(e=>(e.domain||"General")===f)),h.trim()){let e=h.toLowerCase();t=t.filter(t=>t.name.toLowerCase().includes(e)||t.description?.toLowerCase().includes(e)||t.domain?.toLowerCase().includes(e)||t.namespace?.toLowerCase().includes(e)||t.keywords?.some(t=>t.toLowerCase().includes(e)))}return t},[e,h,f]),O=(0,i.useMemo)(()=>(({onSkillClick:e,t})=>[{id:"name",accessorKey:"name",meta:{title:t("publicHub.table.skillName")},header:({column:e})=>(0,s.jsx)(d.SD,{column:e,title:t("publicHub.table.skillName")}),size:200,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:t})=>(0,s.jsx)(g.jQ,{title:t.original.name,className:"max-w-72",onClick:()=>e(t.original)})},{id:"description",accessorKey:"description",meta:{title:t("publicHub.table.description")},header:t("publicHub.table.description"),size:260,enableSorting:!1,cell:({row:e})=>(0,s.jsx)("span",{className:"block max-w-72 truncate text-xs",title:e.original.description||void 0,children:e.original.description||"-"})},{id:"category",accessorKey:"category",meta:{title:t("publicHub.table.category"),skeleton:"badge"},header:({column:e})=>(0,s.jsx)(d.SD,{column:e,title:t("publicHub.table.category")}),size:130,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>e.original.category?(0,s.jsx)(x.E,{variant:"secondary",children:e.original.category}):(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:"-"})},{id:"domain",accessorKey:"domain",meta:{title:t("publicHub.table.domain")},header:({column:e})=>(0,s.jsx)(d.SD,{column:e,title:t("publicHub.table.domain")}),size:130,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>(0,s.jsx)("span",{className:"text-xs",children:e.original.domain||"-"})},{id:"source",meta:{title:t("publicHub.table.source")},header:t("publicHub.table.source"),size:200,enableSorting:!1,cell:({row:e})=>{let t=function(e){let t=e.source;if(t?.source==="github"&&t.repo)return{url:`https://github.com/${t.repo}`,label:t.repo};if(t?.source==="git-subdir"&&t.url){let e=t.path?`${t.url}/tree/main/${t.path}`:t.url;return{url:e,label:e.replace("https://github.com/","")}}return t?.source==="url"&&t.url?{url:t.url,label:t.url.replace(/^https?:\/\//,"")}:null}(e.original);return t?(0,s.jsxs)("a",{href:t.url,target:"_blank",rel:"noopener noreferrer",className:"flex max-w-60 items-center gap-1 text-xs text-primary hover:underline",title:t.label,children:[(0,s.jsx)("span",{className:"truncate",children:t.label}),(0,s.jsx)(u.A,{className:"size-3 shrink-0"})]}):(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:"-"})}},{id:"enabled",accessorKey:"enabled",meta:{title:t("publicHub.table.status"),skeleton:"badge"},header:({column:e})=>(0,s.jsx)(d.SD,{column:e,title:t("publicHub.table.status")}),size:100,enableSorting:!0,cell:({row:e})=>(0,s.jsx)(g.Wh,{tone:e.original.enabled?"success":"neutral",label:e.original.enabled?t("publicHub.table.enabled"):t("publicHub.table.draft")})},{id:"actions",meta:{className:"text-right",headerClassName:"text-right"},header:()=>(0,s.jsx)("span",{className:"sr-only",children:t("publicHub.table.actions")}),size:64,enableSorting:!1,enableHiding:!1,cell:({row:a})=>(0,s.jsx)("div",{className:"flex justify-end",children:(0,s.jsx)(j,{skill:a.original,onSkillClick:e,t:t})})}])({onSkillClick:w,t:p}),[p]),T=h.trim().length>0||null!=f;return N?(0,s.jsx)(y.A,{skill:N,onBack:()=>w(null),isAdmin:a,accessToken:o,onPublishClick:m}):(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid grid-cols-3 gap-4",children:[(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsx)("div",{className:"text-xs text-gray-500 mb-1",children:p("publicHub.skillsDashboard.totalSkills")}),(0,s.jsx)("div",{className:"text-2xl font-semibold text-gray-900",children:S})]}),(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsx)("div",{className:"text-xs text-gray-500 mb-1",children:p("publicHub.skillsDashboard.namespaces")}),(0,s.jsx)("div",{className:"text-2xl font-semibold text-gray-900",children:I.length})]}),(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsx)("div",{className:"text-xs text-gray-500 mb-1",children:p("publicHub.skillsDashboard.domains")}),(0,s.jsx)("div",{className:"text-2xl font-semibold text-gray-900",children:C.length})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-3",children:[(0,s.jsx)("h3",{className:"text-sm font-semibold text-gray-700",children:p(c?"publicHub.skillsDashboard.allPublicSkills":"publicHub.skillsDashboard.allSkills")}),(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)(r.A,{placeholder:p("publicHub.skillsDashboard.allDomains"),allowClear:!0,value:f,onChange:e=>_(e),style:{width:160},options:C.map(e=>({label:e,value:e}))}),(0,s.jsx)(n.A,{prefix:(0,s.jsx)(l.A,{className:"text-gray-400"}),placeholder:p("publicHub.skillsDashboard.searchPlaceholder"),value:h,onChange:e=>b(e.target.value),style:{width:280},allowClear:!0})]})]}),(0,s.jsx)(d.bQ,{data:H,columns:O,getRowId:(e,t)=>e.id||String(t),sortingMode:"client",sorting:k,onSortingChange:E,isLoading:t,loadingMessage:p("publicHub.skillsDashboard.loading"),noDataMessage:(0,s.jsx)(A,{filtered:T,t:p}),size:"compact"}),(0,s.jsx)("div",{className:"mt-3 text-center",children:(0,s.jsx)("p",{className:"text-sm text-gray-500",children:p("publicHub.admin.skillsCount",{shown:H.length,total:S})})})]})]})}},16370:(e,t,a)=>{a.d(t,{A:()=>M});var s=a(31214),i=a(80162),l=a(7166),r=a(7549),n=a(83433),o=a(71810),d=a(78134),c=a(44846),m=a(7705),p=a(44355),u=a(7985),g=a(81255),x=a(90074),h=a(4990),b=a(8834),f=a(35060),_=a(31282),j=a(9440),y=a(16084),v=a(36968),A=a(20148),N=a(52682);let w=e=>`$${(1e6*e).toFixed(4)}`,k=e=>e?e>=1e3?`${(e/1e3).toFixed(0)}K`:e.toString():"N/A",E={healthy:"success",unhealthy:"error"};function S({providers:e}){return(0,s.jsx)("div",{className:"flex flex-wrap gap-1",children:e.map(e=>{let{logo:t}=(0,N.li)(e);return(0,s.jsxs)("span",{className:"flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs",children:[t&&(0,s.jsx)("img",{src:t,alt:e,className:"size-3 shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e})]},e)})})}function C({items:e}){return 0===e.length?(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:"-"}):(0,s.jsxs)("div",{className:"flex items-center gap-1",children:[(0,s.jsx)(A.E,{variant:"secondary",children:e[0]}),e.length>1&&(0,s.jsx)(v.ec,{content:(0,s.jsx)("div",{className:"space-y-1",children:e.map(e=>(0,s.jsxs)("div",{className:"text-xs",children:["• ",e]},e))}),trigger:(0,s.jsxs)("span",{className:"cursor-default text-xs text-muted-foreground",children:["+",e.length-1]})})]})}var I=a(30005),H=a(68764),O=a(18348);let{TabPane:T}=o.A;function L({title:e,body:t}){return(0,s.jsxs)("div",{className:"flex flex-col items-center gap-1 py-6",children:[(0,s.jsx)("div",{className:"mb-1 flex size-10 items-center justify-center rounded-lg bg-muted",children:(0,s.jsx)(u.A,{className:"size-5 text-muted-foreground"})}),(0,s.jsx)("div",{className:"text-sm font-medium text-foreground",children:e}),(0,s.jsx)("div",{className:"text-sm text-muted-foreground",children:t})]})}let M=({accessToken:e,isEmbedded:t=!1})=>{let a,u,M,D,z,R,P,{t:$}=(0,O.Bd)("common"),[Y,B]=(0,h.useState)(null),[F,G]=(0,h.useState)(null),[W,U]=(0,h.useState)(null),[V,K]=(0,h.useState)("LiteLLM Gateway"),[q,Z]=(0,h.useState)(null),[X,Q]=(0,h.useState)(""),[J,ee]=(0,h.useState)({}),[et,ea]=(0,h.useState)(!0),[es,ei]=(0,h.useState)(!0),[el,er]=(0,h.useState)(!0),[en,eo]=(0,h.useState)(""),[ed,ec]=(0,h.useState)(""),[em,ep]=(0,h.useState)(""),[eu,eg]=(0,h.useState)([]),[ex,eh]=(0,h.useState)([]),[eb,ef]=(0,h.useState)([]),[e_,ej]=(0,h.useState)([]),[ey,ev]=(0,h.useState)([]),[eA,eN]=(0,h.useState)(!0),[ew,ek]=(0,h.useState)(!1),[eE,eS]=(0,h.useState)(!1),[eC,eI]=(0,h.useState)(!1),[eH,eO]=(0,h.useState)(null),[eT,eL]=(0,h.useState)(null),[eM,eD]=(0,h.useState)(null),[ez,eR]=(0,h.useState)("models"),[eP,e$]=(0,h.useState)([]),[eY,eB]=(0,h.useState)(!1);(0,h.useEffect)(()=>{(async()=>{try{await (0,j.Dir)()}catch(e){console.error("Failed to get UI config:",e)}let e=async()=>{try{ea(!0);let e=await (0,j.k6p)();B(Array.isArray(e)?e:[])}catch(e){console.error("There was an error fetching the public model data",e),eN(!1)}finally{ea(!1)}},t=async()=>{try{ei(!0);let e=await (0,j.qRV)();G(Array.isArray(e)?e:[])}catch(e){console.error("There was an error fetching the public agent data",e)}finally{ei(!1)}},a=async()=>{try{er(!0);let e=await (0,j.Bsw)();U(Array.isArray(e)?e:[])}catch(e){console.error("There was an error fetching the public MCP server data",e)}finally{er(!1)}},s=async()=>{try{eB(!0);let e=await (0,j.UNC)();e$(e.plugins??[])}catch(e){console.error("There was an error fetching the public skill data",e)}finally{eB(!1)}};(async()=>{let e=await (0,j.qR4)();K(e.docs_title),Z(e.custom_docs_description),Q(e.litellm_version),ee(e.useful_links||{})})(),e(),t(),a(),s()})()},[]),(0,h.useEffect)(()=>{},[en,eu,ex,eb]);let eF=(0,h.useMemo)(()=>{if(!Y||!Array.isArray(Y))return[];let e=Y;if(en.trim()){let t=en.toLowerCase(),a=t.split(/\s+/),s=Y.filter(e=>{let s=e.model_group.toLowerCase();return!!s.includes(t)||a.every(e=>s.includes(e))});s.length>0&&(e=s.sort((e,a)=>{let s=e.model_group.toLowerCase(),i=a.model_group.toLowerCase(),l=1e3*(s===t),r=1e3*(i===t),n=100*!!s.startsWith(t),o=100*!!i.startsWith(t),d=50*!!t.split(/\s+/).every(e=>s.includes(e)),c=50*!!t.split(/\s+/).every(e=>i.includes(e)),m=s.length;return r+o+c+(1e3-i.length)-(l+n+d+(1e3-m))}))}return e.filter(e=>{let t=0===eu.length||eu.some(t=>e.providers.includes(t)),a=0===ex.length||ex.includes(e.mode||""),s=0===eb.length||Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).some(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");return eb.includes(t)});return t&&a&&s})},[Y,en,eu,ex,eb]),eG=(0,h.useMemo)(()=>{if(!F||!Array.isArray(F))return[];let e=F;if(ed.trim()){let t=ed.toLowerCase(),a=t.split(/\s+/);e=(e=F.filter(e=>{let s=e.name.toLowerCase(),i=e.description.toLowerCase();return!!(s.includes(t)||i.includes(t))||a.every(e=>s.includes(e)||i.includes(e))})).sort((e,a)=>{let s=e.name.toLowerCase(),i=a.name.toLowerCase(),l=1e3*(s===t),r=1e3*(i===t),n=100*!!s.startsWith(t),o=100*!!i.startsWith(t),d=l+n+(1e3-s.length);return r+o+(1e3-i.length)-d})}return e.filter(e=>0===e_.length||e.skills?.some(e=>e.tags?.some(e=>e_.includes(e))))},[F,ed,e_]),eW=(0,h.useMemo)(()=>{if(!W||!Array.isArray(W))return[];let e=W;if(em.trim()){let t=em.toLowerCase(),a=t.split(/\s+/);e=(e=W.filter(e=>{let s=e.server_name.toLowerCase(),i=(e.mcp_info?.description||"").toLowerCase();return!!(s.includes(t)||i.includes(t))||a.every(e=>s.includes(e)||i.includes(e))})).sort((e,a)=>{let s=e.server_name.toLowerCase(),i=a.server_name.toLowerCase(),l=1e3*(s===t),r=1e3*(i===t),n=100*!!s.startsWith(t),o=100*!!i.startsWith(t),d=l+n+(1e3-s.length);return r+o+(1e3-i.length)-d})}return e.filter(e=>0===ey.length||ey.includes(e.transport))},[W,em,ey]),eU=(0,h.useCallback)(e=>{eO(e),ek(!0)},[]),eV=(0,h.useCallback)(e=>{eL(e),eS(!0)},[]),eK=(0,h.useCallback)(e=>{eD(e),eI(!0)},[]),eq=e=>{navigator.clipboard.writeText(e),f.Ay.success($("publicHub.details.copied"))},eZ=e=>`$${(1e6*e).toFixed(4)}`,[eX,eQ]=(0,h.useState)([{id:"model_group",desc:!1}]),[eJ,e0]=(0,h.useState)([{id:"name",desc:!1}]),[e1,e2]=(0,h.useState)([{id:"server_name",desc:!1}]),e4=(0,h.useMemo)(()=>(({onModelClick:e})=>[{id:"model_group",accessorKey:"model_group",meta:{title:"Model Name"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Model Name"}),size:200,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:t})=>(0,s.jsx)(v.jQ,{title:t.original.model_group,titleClassName:"font-mono text-xs font-normal",className:"max-w-72",onClick:()=>e(t.original)})},{id:"providers",accessorKey:"providers",meta:{title:"Providers",skeleton:"chips"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Providers"}),size:150,enableSorting:!0,sortingFn:(e,t)=>(e.original.providers??[]).join(", ").localeCompare((t.original.providers??[]).join(", ")),cell:({row:e})=>(0,s.jsx)(S,{providers:e.original.providers??[]})},{id:"mode",accessorKey:"mode",meta:{title:"Mode"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Mode"}),size:110,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>(0,s.jsxs)("span",{className:"flex items-center gap-2 text-sm",children:[(0,s.jsx)("span",{children:(e=>{switch(e?.toLowerCase()){case"chat":return"\uD83D\uDCAC";case"rerank":return"\uD83D\uDD04";case"embedding":return"\uD83D\uDCC4";default:return"\uD83E\uDD16"}})(e.original.mode||"")}),(0,s.jsx)("span",{children:e.original.mode||"Chat"})]})},{id:"max_input_tokens",accessorKey:"max_input_tokens",meta:{title:"Max Input",numeric:!0},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Max Input"}),size:100,enableSorting:!0,cell:({row:e})=>(0,s.jsx)("span",{className:"text-sm",children:k(e.original.max_input_tokens)})},{id:"max_output_tokens",accessorKey:"max_output_tokens",meta:{title:"Max Output",numeric:!0},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Max Output"}),size:100,enableSorting:!0,cell:({row:e})=>(0,s.jsx)("span",{className:"text-sm",children:k(e.original.max_output_tokens)})},{id:"input_cost_per_token",accessorKey:"input_cost_per_token",meta:{title:"Input $/1M",numeric:!0},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Input $/1M"}),size:110,enableSorting:!0,cell:({row:e})=>(0,s.jsx)("span",{className:"text-sm",children:e.original.input_cost_per_token?w(e.original.input_cost_per_token):"Free"})},{id:"output_cost_per_token",accessorKey:"output_cost_per_token",meta:{title:"Output $/1M",numeric:!0},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Output $/1M"}),size:110,enableSorting:!0,cell:({row:e})=>(0,s.jsx)("span",{className:"text-sm",children:e.original.output_cost_per_token?w(e.original.output_cost_per_token):"Free"})},{id:"features",meta:{title:"Features",skeleton:"chips"},header:"Features",size:140,enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "));return(0,s.jsx)(C,{items:t})}},{id:"health_status",accessorKey:"health_status",meta:{title:"Health Status",skeleton:"badge"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Health Status"}),size:130,enableSorting:!0,cell:({row:e})=>{let t=e.original,a=t.health_response_time?`Response Time: ${Number(t.health_response_time).toFixed(2)}ms`:"N/A",i=t.health_checked_at?`Last Checked: ${new Date(t.health_checked_at).toLocaleString()}`:"N/A";return(0,s.jsx)(v.ec,{content:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{children:a}),(0,s.jsx)("div",{children:i})]}),trigger:(0,s.jsx)("span",{className:"capitalize",children:(0,s.jsx)(v.Wh,{tone:E[t.health_status??""]||"neutral",label:t.health_status??"Unknown"})})})}},{id:"rpm",accessorKey:"rpm",meta:{title:"Limits"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Limits"}),size:150,enableSorting:!0,cell:({row:e})=>{var t,a;let i;return(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:(t=e.original.rpm,a=e.original.tpm,(i=[...t?[`RPM: ${t.toLocaleString()}`]:[],...a?[`TPM: ${a.toLocaleString()}`]:[]]).length>0?i.join(", "):"N/A")})}}])({onModelClick:eU}),[eU]),e6=(0,h.useMemo)(()=>(({onAgentClick:e})=>[{id:"name",accessorKey:"name",meta:{title:"Agent Name"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Agent Name"}),size:200,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:t})=>(0,s.jsx)(v.jQ,{title:t.original.name,titleClassName:"font-mono text-xs font-normal",className:"max-w-72",onClick:()=>e(t.original)})},{id:"description",accessorKey:"description",meta:{title:"Description"},header:"Description",size:260,enableSorting:!1,cell:({row:e})=>(0,s.jsx)("span",{className:"block max-w-72 truncate text-sm",title:e.original.description||void 0,children:e.original.description||"-"})},{id:"version",accessorKey:"version",meta:{title:"Version"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Version"}),size:90,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>(0,s.jsx)("span",{className:"text-sm",children:e.original.version})},{id:"provider",meta:{title:"Provider"},header:"Provider",size:130,enableSorting:!1,cell:({row:e})=>e.original.provider?(0,s.jsx)("span",{className:"text-sm font-medium",children:e.original.provider.organization}):(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:"-"})},{id:"skills",meta:{title:"Skills",skeleton:"chips"},header:"Skills",size:160,enableSorting:!1,cell:({row:e})=>(0,s.jsx)(C,{items:(e.original.skills||[]).map(e=>e.name)})},{id:"capabilities",meta:{title:"Capabilities",skeleton:"chips"},header:"Capabilities",size:160,enableSorting:!1,cell:({row:e})=>{let t=Object.entries(e.original.capabilities||{}).filter(([,e])=>!0===e).map(([e])=>e);return 0===t.length?(0,s.jsx)("span",{className:"text-xs text-muted-foreground",children:"-"}):(0,s.jsx)("div",{className:"flex flex-wrap gap-1",children:t.map(e=>(0,s.jsx)(A.E,{variant:"outline",className:"capitalize",children:e},e))})}}])({onAgentClick:eV}),[eV]),e3=(0,h.useMemo)(()=>(({onServerClick:e})=>[{id:"server_name",accessorKey:"server_name",meta:{title:"Server Name"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Server Name"}),size:180,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:t})=>(0,s.jsx)(v.jQ,{title:t.original.server_name,titleClassName:"font-mono text-xs font-normal",className:"max-w-72",onClick:()=>e(t.original)})},{id:"description",meta:{title:"Description"},header:"Description",size:260,enableSorting:!1,cell:({row:e})=>{let t=String(e.original.mcp_info?.description??"-");return(0,s.jsx)("span",{className:"block max-w-72 truncate text-sm",title:t,children:t})}},{id:"transport",accessorKey:"transport",meta:{title:"Transport",skeleton:"badge"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Transport"}),size:110,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>(0,s.jsx)(A.E,{variant:"secondary",className:"font-mono font-normal uppercase",children:e.original.transport})},{id:"auth_type",accessorKey:"auth_type",meta:{title:"Auth Type",skeleton:"badge"},header:({column:e})=>(0,s.jsx)(b.SD,{column:e,title:"Auth Type"}),size:110,enableSorting:!0,sortingFn:"alphanumeric",cell:({row:e})=>(0,s.jsx)(v.Wh,{tone:"none"===e.original.auth_type?"neutral":"success",label:e.original.auth_type})}])({onServerClick:eK}),[eK]);return(0,s.jsx)(i.N,{accessToken:e,children:(0,s.jsxs)("div",{className:t?"w-full":"min-h-screen bg-white",children:[!t&&(0,s.jsx)(_.A,{accessToken:e||null,isPublicPage:!0}),(0,s.jsxs)("div",{className:t?"w-full p-6":"w-full px-8 py-12",children:[t&&(0,s.jsx)("div",{className:"mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg",children:(0,s.jsx)("p",{className:"text-sm text-gray-700",children:$("publicHub.embeddedDescription")})}),!t&&(0,s.jsxs)(n.Zp,{className:"mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-xs",children:[(0,s.jsx)(n.hE,{className:"text-2xl font-semibold mb-6 text-gray-900",children:$("publicHub.about")}),(0,s.jsx)("p",{className:"text-gray-700 mb-6 text-base leading-relaxed",children:q||$("publicHub.defaultDescription")}),(0,s.jsx)("div",{className:"flex items-center space-x-3 text-sm text-gray-600",children:(0,s.jsxs)("span",{className:"flex items-center",children:[(0,s.jsx)("span",{className:"w-4 h-4 mr-2",children:"\uD83D\uDD27"}),$("publicHub.builtWith"),": v",X]})})]}),J&&Object.keys(J).length>0&&(0,s.jsxs)(n.Zp,{className:"mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-xs",children:[(0,s.jsx)(n.hE,{className:"text-2xl font-semibold mb-6 text-gray-900",children:$("publicHub.usefulLinks")}),(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Object.entries(J||{}).map(([e,t])=>({title:e,url:"string"==typeof t?t:t.url,index:"string"==typeof t?0:t.index??0})).sort((e,t)=>e.index-t.index).map(({title:e,url:t})=>(0,s.jsxs)("button",{onClick:()=>window.open(t,"_blank"),className:"flex items-center space-x-3 text-blue-600 hover:text-blue-800 transition-colors p-3 rounded-lg hover:bg-blue-50 border border-gray-200",children:[(0,s.jsx)(l.A,{className:"w-4 h-4"}),(0,s.jsx)(n.EY,{className:"text-sm font-medium",children:e})]},e))})]}),!t&&(0,s.jsxs)(n.Zp,{className:"mb-10 p-8 bg-white border border-gray-200 rounded-lg shadow-xs",children:[(0,s.jsx)(n.hE,{className:"text-2xl font-semibold mb-6 text-gray-900",children:$("publicHub.healthTitle")}),(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:(0,s.jsxs)(n.EY,{className:eA?"text-green-600 font-medium text-sm":"text-red-600 font-medium text-sm",children:[$("publicHub.serviceStatus"),": ",$(eA?"publicHub.alive":"publicHub.unavailable")]})})]}),(0,s.jsx)(n.Zp,{className:"p-8 bg-white border border-gray-200 rounded-lg shadow-xs",children:(0,s.jsxs)(o.A,{activeKey:ez,onChange:eR,size:"large",className:"public-hub-tabs",children:[(0,s.jsxs)(T,{tab:$("publicHub.tabs.models"),children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(n.hE,{className:"text-2xl font-semibold text-gray-900",children:$("publicHub.available.models")})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium text-gray-700",children:$("publicHub.search.models")}),(0,s.jsx)(d.A,{title:$("publicHub.search.modelTooltip"),placement:"top",children:(0,s.jsx)(g.A,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(r.A,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:$("publicHub.search.modelPlaceholder"),value:en,onChange:e=>eo(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-3 text-gray-700",children:$("publicHub.filters.provider")}),(0,s.jsx)(c.A,{mode:"multiple",value:eu,onChange:e=>eg(e),placeholder:$("publicHub.filters.providersPlaceholder"),className:"w-full",size:"large",allowClear:!0,optionRender:e=>{let{logo:t}=(0,N.li)(e.value);return(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[t&&(0,s.jsx)("img",{src:t,alt:e.label,className:"w-5 h-5 shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e.label})]})},children:Y&&Array.isArray(Y)&&(a=new Set,Y.forEach(e=>{(e.providers??[]).forEach(e=>a.add(e))}),Array.from(a)).map(e=>(0,s.jsx)(c.A.Option,{value:e,children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-3 text-gray-700",children:$("publicHub.filters.mode")}),(0,s.jsx)(c.A,{mode:"multiple",value:ex,onChange:e=>eh(e),placeholder:$("publicHub.filters.modesPlaceholder"),className:"w-full",size:"large",allowClear:!0,children:Y&&Array.isArray(Y)&&(u=new Set,Y.forEach(e=>{e.mode&&u.add(e.mode)}),Array.from(u)).map(e=>(0,s.jsx)(c.A.Option,{value:e,children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-3 text-gray-700",children:$("publicHub.filters.features")}),(0,s.jsx)(c.A,{mode:"multiple",value:eb,onChange:e=>ef(e),placeholder:$("publicHub.filters.featuresPlaceholder"),className:"w-full",size:"large",allowClear:!0,children:Y&&Array.isArray(Y)&&(M=new Set,Y.forEach(e=>{Object.entries(e).filter(([e,t])=>e.startsWith("supports_")&&!0===t).forEach(([e])=>{let t=e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");M.add(t)})}),Array.from(M).sort()).map(e=>(0,s.jsx)(c.A.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(b.bQ,{data:eF,columns:e4,getRowId:(e,t)=>e.model_group||String(t),sortingMode:"client",sorting:eX,onSortingChange:eQ,isLoading:et,loadingMessage:$("publicHub.loading.models"),noDataMessage:(0,s.jsx)(L,{title:Y?.length?$("publicHub.empty.modelsFilteredTitle"):$("publicHub.empty.modelsTitle"),body:Y?.length?$("publicHub.empty.modelsFilteredBody"):$("publicHub.empty.modelsBody")}),size:"compact"}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsx)(n.EY,{className:"text-sm text-gray-600",children:$("publicHub.counts.models",{shown:eF.length,total:Y?.length||0})})})]},"models"),F&&Array.isArray(F)&&F.length>0&&(0,s.jsxs)(T,{tab:$("publicHub.tabs.agents"),children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(n.hE,{className:"text-2xl font-semibold text-gray-900",children:$("publicHub.available.agents")})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium text-gray-700",children:$("publicHub.search.agents")}),(0,s.jsx)(d.A,{title:$("publicHub.search.agentTooltip"),placement:"top",children:(0,s.jsx)(g.A,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(r.A,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:$("publicHub.search.agentPlaceholder"),value:ed,onChange:e=>ec(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-3 text-gray-700",children:$("publicHub.filters.skills")}),(0,s.jsx)(c.A,{mode:"multiple",value:e_,onChange:e=>ej(e),placeholder:$("publicHub.filters.skillsPlaceholder"),className:"w-full",size:"large",allowClear:!0,children:F&&Array.isArray(F)&&(D=new Set,F.forEach(e=>{e.skills?.forEach(e=>{e.tags?.forEach(e=>D.add(e))})}),Array.from(D).sort()).map(e=>(0,s.jsx)(c.A.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(b.bQ,{data:eG,columns:e6,getRowId:(e,t)=>e.name||String(t),sortingMode:"client",sorting:eJ,onSortingChange:e0,isLoading:es,loadingMessage:$("publicHub.loading.agents"),noDataMessage:(0,s.jsx)(L,{title:$("publicHub.empty.agentsTitle"),body:$("publicHub.empty.agentsBody")}),size:"compact"}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsx)(n.EY,{className:"text-sm text-gray-600",children:$("publicHub.counts.agents",{shown:eG.length,total:F?.length||0})})})]},"agents"),W&&Array.isArray(W)&&W.length>0&&(0,s.jsxs)(T,{tab:$("publicHub.tabs.mcp"),children:[(0,s.jsx)("div",{className:"flex justify-between items-center mb-8",children:(0,s.jsx)(n.hE,{className:"text-2xl font-semibold text-gray-900",children:$("publicHub.available.mcp")})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mb-3",children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium text-gray-700",children:$("publicHub.search.mcp")}),(0,s.jsx)(d.A,{title:$("publicHub.search.mcpTooltip"),placement:"top",children:(0,s.jsx)(g.A,{className:"w-4 h-4 text-gray-400 cursor-help"})})]}),(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)(r.A,{className:"w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"}),(0,s.jsx)("input",{type:"text",placeholder:$("publicHub.search.mcpPlaceholder"),value:em,onChange:e=>ep(e.target.value),className:"border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-3 text-gray-700",children:$("publicHub.filters.transport")}),(0,s.jsx)(c.A,{mode:"multiple",value:ey,onChange:e=>ev(e),placeholder:$("publicHub.filters.transportPlaceholder"),className:"w-full",size:"large",allowClear:!0,children:W&&Array.isArray(W)&&(z=new Set,W.forEach(e=>{e.transport&&z.add(e.transport)}),Array.from(z).sort()).map(e=>(0,s.jsx)(c.A.Option,{value:e,children:e},e))})]})]}),(0,s.jsx)(b.bQ,{data:eW,columns:e3,getRowId:(e,t)=>e.server_id||String(t),sortingMode:"client",sorting:e1,onSortingChange:e2,isLoading:el,loadingMessage:$("publicHub.loading.mcp"),noDataMessage:(0,s.jsx)(L,{title:$("publicHub.empty.mcpTitle"),body:$("publicHub.empty.mcpBody")}),size:"compact"}),(0,s.jsx)("div",{className:"mt-8 text-center",children:(0,s.jsx)(n.EY,{className:"text-sm text-gray-600",children:$("publicHub.counts.mcp",{shown:eW.length,total:W?.length||0})})})]},"mcp"),(0,s.jsx)(T,{tab:$("publicHub.tabs.skills"),children:(0,s.jsx)(y.A,{skills:eP,isLoading:eY,publicPage:!0})},"skills")]})})]}),(0,s.jsx)(m.A,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:eH?.model_group||$("publicHub.details.modelDetails")}),eH&&(0,s.jsx)(d.A,{title:$("publicHub.details.copyModelName"),children:(0,s.jsx)(x.A,{onClick:()=>eq(eH.model_group),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:ew,footer:null,onOk:()=>{ek(!1),eO(null)},onCancel:()=>{ek(!1),eO(null)},children:eH&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.modelOverview")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.modelName")}),(0,s.jsx)(n.EY,{children:eH.model_group})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.mode")}),(0,s.jsx)(n.EY,{children:eH.mode||$("publicHub.details.notSpecified")})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.providers")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:(eH.providers??[]).map(e=>{let{logo:t}=(0,N.li)(e);return(0,s.jsx)(p.A,{color:"blue",children:(0,s.jsxs)("div",{className:"flex items-center space-x-1",children:[t&&(0,s.jsx)("img",{src:t,alt:e,className:"w-3 h-3 shrink-0 object-contain",onError:e=>{e.target.style.display="none"}}),(0,s.jsx)("span",{className:"capitalize",children:e})]})},e)})})]})]}),eH.model_group.includes("*")&&(0,s.jsx)("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:(0,s.jsxs)("div",{className:"flex items-start space-x-2",children:[(0,s.jsx)(g.A,{className:"w-4 h-4 text-blue-600 mt-0.5 shrink-0"}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium text-blue-900 mb-2",children:$("publicHub.details.wildcardRouting")}),(0,s.jsx)(n.EY,{className:"text-sm text-blue-800 mb-2",children:$("publicHub.details.wildcardDescription")}),(0,s.jsx)(n.EY,{className:"text-sm text-blue-800",children:$("publicHub.details.wildcardExample",{modelGroup:eH.model_group,exampleModelGroup:eH.model_group.replaceAll("*","my-custom-value")})})]})]})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.tokenCost")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.maxInputTokens")}),(0,s.jsx)(n.EY,{children:eH.max_input_tokens?.toLocaleString()||$("publicHub.details.notSpecified")})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.maxOutputTokens")}),(0,s.jsx)(n.EY,{children:eH.max_output_tokens?.toLocaleString()||$("publicHub.details.notSpecified")})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.inputCost")}),(0,s.jsx)(n.EY,{children:eH.input_cost_per_token?eZ(eH.input_cost_per_token):$("publicHub.details.notSpecified")})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.outputCost")}),(0,s.jsx)(n.EY,{children:eH.output_cost_per_token?eZ(eH.output_cost_per_token):$("publicHub.details.notSpecified")})]})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.capabilities")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:(R=Object.entries(eH).filter(([e,t])=>e.startsWith("supports_")&&!0===t).map(([e])=>e),P=["green","blue","purple","orange","red","yellow"],0===R.length?(0,s.jsx)(n.EY,{className:"text-gray-500",children:$("publicHub.details.noCapabilities")}):R.map((e,t)=>(0,s.jsx)(p.A,{color:P[t%P.length],children:e.replace(/^supports_/,"").split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")},e)))})]}),(eH.tpm||eH.rpm)&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.rateLimits")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[eH.tpm&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.tokensPerMinute")}),(0,s.jsx)(n.EY,{children:eH.tpm.toLocaleString()})]}),eH.rpm&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.requestsPerMinute")}),(0,s.jsx)(n.EY,{children:eH.rpm.toLocaleString()})]})]})]}),eH.supported_openai_params&&eH.supported_openai_params.length>0&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.supportedParameters")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:eH.supported_openai_params.map(e=>(0,s.jsx)(p.A,{color:"green",children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.usageExample")}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-sm",children:(0,I.O)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,H.yz)(eH.mode||"chat"),selectedModel:eH.model_group,selectedSdk:"openai"})})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eq((0,I.O)({apiKeySource:"custom",accessToken:null,apiKey:"your_api_key",inputMessage:"Hello, how are you?",chatHistory:[{role:"user",content:"Hello, how are you?",isImage:!1}],selectedTags:[],selectedVectorStores:[],selectedGuardrails:[],selectedPolicies:[],selectedMCPServers:[],endpointType:(0,H.yz)(eH.mode||"chat"),selectedModel:eH.model_group,selectedSdk:"openai"}))},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:$("publicHub.details.copy")})})]})]})}),(0,s.jsx)(m.A,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:eT?.name||$("publicHub.details.agentDetails")}),eT&&(0,s.jsx)(d.A,{title:$("publicHub.details.copyAgentName"),children:(0,s.jsx)(x.A,{onClick:()=>eq(eT.name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:eE,footer:null,onOk:()=>{eS(!1),eL(null)},onCancel:()=>{eS(!1),eL(null)},children:eT&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.agentOverview")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.name")}),(0,s.jsx)(n.EY,{children:eT.name})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.version")}),(0,s.jsx)(n.EY,{children:eT.version})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.description")}),(0,s.jsx)(n.EY,{children:eT.description})]}),eT.url&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.url")}),(0,s.jsx)("a",{href:eT.url,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 text-sm break-all",children:eT.url})]})]})]}),eT.capabilities&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.capabilities")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-2",children:Object.entries(eT.capabilities).filter(([e,t])=>!0===t).map(([e])=>(0,s.jsx)(p.A,{color:"green",className:"capitalize",children:e},e))})]}),eT.skills&&eT.skills.length>0&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.skills")}),(0,s.jsx)("div",{className:"space-y-4",children:eT.skills.map((e,t)=>(0,s.jsxs)("div",{className:"border border-gray-200 rounded-lg p-4",children:[(0,s.jsx)("div",{className:"flex items-start justify-between mb-2",children:(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium text-base",children:e.name}),(0,s.jsx)(n.EY,{className:"text-sm text-gray-600",children:e.description})]})}),e.tags&&e.tags.length>0&&(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-2",children:e.tags.map(e=>(0,s.jsx)(p.A,{color:"purple",className:"text-xs",children:e},e))})]},t))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.inputOutputModes")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.inputModes")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:(eT.defaultInputModes??[]).map(e=>(0,s.jsx)(p.A,{color:"blue",children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.outputModes")}),(0,s.jsx)("div",{className:"flex flex-wrap gap-1 mt-1",children:(eT.defaultOutputModes??[]).map(e=>(0,s.jsx)(p.A,{color:"blue",children:e},e))})]})]})]}),eT.documentationUrl&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.documentation")}),(0,s.jsxs)("a",{href:eT.documentationUrl,target:"_blank",rel:"noopener noreferrer",className:"text-blue-600 hover:text-blue-800 flex items-center space-x-2",children:[(0,s.jsx)(l.A,{className:"w-4 h-4"}),(0,s.jsx)("span",{children:$("publicHub.details.viewDocumentation")})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.a2aUsage")}),(0,s.jsxs)("div",{className:"mb-4",children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-2 text-gray-700",children:$("publicHub.details.stepOne")}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-xs",children:`base_url = '${eT.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eq(`from a2a.client import A2ACardResolver, A2AClient
from a2a.types import (
    AgentCard,
    MessageSendParams,
    SendMessageRequest,
    SendStreamingMessageRequest,
)
from a2a.utils.constants import (
    AGENT_CARD_WELL_KNOWN_PATH,
    EXTENDED_AGENT_CARD_PATH,
)

base_url = '${eT.url}'

resolver = A2ACardResolver(
    httpx_client=httpx_client,
    base_url=base_url,
    # agent_card_path uses default, extended_agent_card_path also uses default
)

# Fetch Public Agent Card and Initialize Client
final_agent_card_to_use: AgentCard | None = None
_public_card = (
    await resolver.get_agent_card()
)  # Fetches from default public path - \`/agents/{agent_id}/\`
final_agent_card_to_use = _public_card

if _public_card.supports_authenticated_extended_card:
    try:
        auth_headers_dict = {
            'Authorization': 'Bearer dummy-token-for-extended-card'
        }
        _extended_card = await resolver.get_agent_card(
            relative_card_path=EXTENDED_AGENT_CARD_PATH,
            http_kwargs={'headers': auth_headers_dict},
        )
        final_agent_card_to_use = (
            _extended_card  # Update to use the extended card
        )
    except Exception as e_extended:
        logger.warning(
            f'Failed to fetch extended agent card: {e_extended}. Will proceed with public card.',
            exc_info=True,
        )`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:$("publicHub.details.copy")})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-sm font-medium mb-2 text-gray-700",children:$("publicHub.details.stepTwo")}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-xs",children:`client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eq(`client = A2AClient(
    httpx_client=httpx_client, agent_card=final_agent_card_to_use
)

send_message_payload: dict[str, Any] = {
    'message': {
        'role': 'user',
        'parts': [
            {'kind': 'text', 'text': 'how much is 10 USD in INR?'}
        ],
        'messageId': uuid4().hex,
    },
}
request = SendMessageRequest(
    id=str(uuid4()), params=MessageSendParams(**send_message_payload)
)

response = await client.send_message(request)
print(response.model_dump(mode='json', exclude_none=True))`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:$("publicHub.details.copy")})})]})]})]})}),(0,s.jsx)(m.A,{title:(0,s.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,s.jsx)("span",{children:eM?.server_name||$("publicHub.details.mcpDetails")}),eM&&(0,s.jsx)(d.A,{title:$("publicHub.details.copyServerName"),children:(0,s.jsx)(x.A,{onClick:()=>eq(eM.server_name),className:"cursor-pointer text-gray-500 hover:text-blue-500 w-4 h-4"})})]}),width:1e3,open:eC,footer:null,onOk:()=>{eI(!1),eD(null)},onCancel:()=>{eI(!1),eD(null)},children:eM&&(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.serverOverview")}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.serverName")}),(0,s.jsx)(n.EY,{children:eM.server_name})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.transport")}),(0,s.jsx)(p.A,{color:"blue",children:eM.transport})]}),eM.alias&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.alias")}),(0,s.jsx)(n.EY,{children:eM.alias})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.authType")}),(0,s.jsx)(p.A,{color:"none"===eM.auth_type?"gray":"green",children:eM.auth_type})]}),(0,s.jsxs)("div",{className:"col-span-2",children:[(0,s.jsx)(n.EY,{className:"font-medium",children:$("publicHub.details.description")}),(0,s.jsx)(n.EY,{children:eM.mcp_info?.description||"-"})]})]})]}),eM.mcp_info&&Object.keys(eM.mcp_info).length>0&&(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.additionalInformation")}),(0,s.jsx)("div",{className:"bg-gray-50 p-4 rounded-lg",children:(0,s.jsx)("pre",{className:"text-xs overflow-x-auto",children:JSON.stringify(eM.mcp_info,null,2)})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(n.EY,{className:"text-lg font-semibold mb-4",children:$("publicHub.details.usageExample")}),(0,s.jsx)("div",{className:"bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto",children:(0,s.jsx)("pre",{className:"text-sm",children:`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${eM.server_name}": {
            "url": "${(0,j.TtI)()}/${eM.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`})}),(0,s.jsx)("div",{className:"mt-2 text-right",children:(0,s.jsx)("button",{onClick:()=>{eq(`# Using MCP Server with Python FastMCP

from fastmcp import Client
import asyncio

# Standard MCP configuration
config = {
    "mcpServers": {
        "${eM.server_name}": {
            "url": "${(0,j.TtI)()}/${eM.server_name}/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        # Call a tool
        response = await client.call_tool(
            name="tool_name", 
            arguments={"arg": "value"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())`)},className:"text-sm text-blue-600 hover:text-blue-800 cursor-pointer",children:$("publicHub.details.copy")})})]})]})})]})})}},20915:(e,t,a)=>{a.d(t,{s:()=>r});var s=a(34995),i=a(82233);let l=/^(https?:|data:|blob:|\/\/)/i,r=(e,t=s.l)=>{let a;if(!e)return;if(l.test(e)||e.includes("/_next/static/"))return e;let r=(0,i.d1)(t);return r&&(e===r||e.startsWith(`${r}/`))?e:(a=(0,i.d1)(t),`${a}${e.startsWith("/")?e:`/${e}`}`)}},30005:(e,t,a)=>{a.d(t,{O:()=>i});var s=a(68764);let i=e=>{let t,{apiKeySource:a,accessToken:i,apiKey:l,inputMessage:r,chatHistory:n,selectedTags:o,selectedVectorStores:d,selectedGuardrails:c,selectedPolicies:m,selectedVoice:p,endpointType:u,selectedModel:g,selectedSdk:x,proxySettings:h}=e,b="session"===a?i:l,f=window.location.origin,_=h?.LITELLM_UI_API_DOC_BASE_URL;_&&_.trim()?f=_:h?.PROXY_BASE_URL&&(f=h.PROXY_BASE_URL);let j=r||"Your prompt here",y=j.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n"),v=n.filter(e=>!e.isImage).map(({role:e,content:t})=>({role:e,content:t})),A={};o.length>0&&(A.tags=o),d.length>0&&(A.vector_stores=d),c.length>0&&(A.guardrails=c),m.length>0&&(A.policies=m);let N=g||"your-model-name",w="azure"===x?`import openai

client = openai.AzureOpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	azure_endpoint="${f}",
	api_version="2024-02-01"
)`:`import openai

client = openai.OpenAI(
	api_key="${b||"YOUR_LITELLM_API_KEY"}",
	base_url="${f}"
)`;switch(u){case s.sx.CHAT:{let e=Object.keys(A).length>0,a="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let s=v.length>0?v:[{role:"user",content:j}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.chat.completions.create(
    model="${N}",
    messages=${JSON.stringify(s,null,4)}${a}
)

print(response)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.chat.completions.create(
#     model="${N}",
#     messages=[
#         {
#             "role": "user",
#             "content": [
#                 {
#                     "type": "text",
#                     "text": "${y}"
#                 },
#                 {
#                     "type": "image_url",
#                     "image_url": {
#                         "url": f"data:image/jpeg;base64,{base64_file}"  # or data:application/pdf;base64,{base64_file}
#                     }
#                 }
#             ]
#         }
#     ]${a}
# )
# print(response_with_file)
`;break}case s.sx.RESPONSES:{let e=Object.keys(A).length>0,a="";if(e){let e=JSON.stringify({metadata:A},null,2).split("\n").map(e=>" ".repeat(4)+e).join("\n").trim();a=`,
    extra_body=${e}`}let s=v.length>0?v:[{role:"user",content:j}];t=`
import base64

# Helper function to encode images to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Example with text only
response = client.responses.create(
    model="${N}",
    input=${JSON.stringify(s,null,4)}${a}
)

print(response.output_text)

# Example with image or PDF (uncomment and provide file path to use)
# base64_file = encode_image("path/to/your/file.jpg")  # or .pdf
# response_with_file = client.responses.create(
#     model="${N}",
#     input=[
#         {
#             "role": "user",
#             "content": [
#                 {"type": "input_text", "text": "${y}"},
#                 {
#                     "type": "input_image",
#                     "image_url": f"data:image/jpeg;base64,{base64_file}",  # or data:application/pdf;base64,{base64_file}
#                 },
#             ],
#         }
#     ]${a}
# )
# print(response_with_file.output_text)
`;break}case s.sx.IMAGE:t="azure"===x?`
# NOTE: The Azure SDK does not have a direct equivalent to the multi-modal 'responses.create' method shown for OpenAI.
# This snippet uses 'client.images.generate' and will create a new image based on your prompt.
# It does not use the uploaded image, as 'client.images.generate' does not support image inputs in this context.
import os
import requests
import json
import time
from PIL import Image

result = client.images.generate(
	model="${N}",
	prompt="${r}",
	n=1
)

json_response = json.loads(result.model_dump_json())

# Set the directory for the stored image
image_dir = os.path.join(os.curdir, 'images')

# If the directory doesn't exist, create it
if not os.path.isdir(image_dir):
	os.mkdir(image_dir)

# Initialize the image path
image_filename = f"generated_image_{int(time.time())}.png"
image_path = os.path.join(image_dir, image_filename)

try:
	# Retrieve the generated image
	if json_response.get("data") && len(json_response["data"]) > 0 && json_response["data"][0].get("url"):
			image_url = json_response["data"][0]["url"]
			generated_image = requests.get(image_url).content
			with open(image_path, "wb") as image_file:
					image_file.write(generated_image)

			print(f"Image saved to {image_path}")
			# Display the image
			image = Image.open(image_path)
			image.show()
	else:
			print("Could not find image URL in response.")
			print("Full response:", json_response)
except Exception as e:
	print(f"An error occurred: {e}")
	print("Full response:", json_response)
`:`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${N}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case s.sx.IMAGE_EDITS:t="azure"===x?`
import base64
import os
import time
import json
from PIL import Image
import requests

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# The prompt entered by the user
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${N}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`:`
import base64
import os
import time

# Helper function to encode images to base64
def encode_image(image_path):
	with open(image_path, "rb") as image_file:
			return base64.b64encode(image_file.read()).decode('utf-8')

# Helper function to create a file (simplified for this example)
def create_file(image_path):
	# In a real implementation, this would upload the file to OpenAI
	# For this example, we'll just return a placeholder ID
	return f"file_{os.path.basename(image_path).replace('.', '_')}"

# The prompt entered by the user
prompt = "${y}"

# Encode images to base64
base64_image1 = encode_image("body-lotion.png")
base64_image2 = encode_image("soap.png")

# Create file IDs
file_id1 = create_file("body-lotion.png")
file_id2 = create_file("incense-kit.png")

response = client.responses.create(
	model="${N}",
	input=[
			{
					"role": "user",
					"content": [
							{"type": "input_text", "text": prompt},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image1}",
							},
							{
									"type": "input_image",
									"image_url": f"data:image/jpeg;base64,{base64_image2}",
							},
							{
									"type": "input_image",
									"file_id": file_id1,
							},
							{
									"type": "input_image",
									"file_id": file_id2,
							}
					],
			}
	],
	tools=[{"type": "image_generation"}],
)

# Process the response
image_generation_calls = [
	output
	for output in response.output
	if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
	image_base64 = image_data[0]
	image_filename = f"edited_image_{int(time.time())}.png"
	with open(image_filename, "wb") as f:
			f.write(base64.b64decode(image_base64))
	print(f"Image saved to {image_filename}")
else:
	# If no image is generated, there might be a text response with an explanation
	text_response = [output.text for output in response.output if hasattr(output, 'text')]
	if text_response:
			print("No image generated. Model response:")
			print("\\n".join(text_response))
	else:
			print("No image data found in response.")
	print("Full response for debugging:")
	print(response)
`;break;case s.sx.EMBEDDINGS:t=`
response = client.embeddings.create(
	input="${r||"Your string here"}",
	model="${N}",
	encoding_format="base64" # or "float"
)

print(response.data[0].embedding)
`;break;case s.sx.TRANSCRIPTION:t=`
# Open the audio file
audio_file = open("path/to/your/audio/file.mp3", "rb")

# Make the transcription request
response = client.audio.transcriptions.create(
	model="${N}",
	file=audio_file${r?`,
	prompt="${r.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"`:""}
)

print(response.text)
`;break;case s.sx.SPEECH:t=`
# Make the text-to-speech request
response = client.audio.speech.create(
	model="${N}",
	input="${r||"Your text to convert to speech here"}",
	voice="${p}"  # Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer
)

# Save the audio to a file
output_filename = "output_speech.mp3"
response.stream_to_file(output_filename)
print(f"Audio saved to {output_filename}")

# Optional: Customize response format and speed
# response = client.audio.speech.create(
#     model="${N}",
#     input="${r||"Your text to convert to speech here"}",
#     voice="alloy",
#     response_format="mp3",  # Options: mp3, opus, aac, flac, wav, pcm
#     speed=1.0  # Range: 0.25 to 4.0
# )
# response.stream_to_file("output_speech.mp3")
`;break;default:t="\n# Code generation for this endpoint is not implemented yet."}return`${w}
${t}`}},38869:(e,t,a)=>{a.d(t,{A:()=>m});var s=a(31214),i=a(4990),l=a(26608),r=a(79508),n=a(79883),o=a(49972),d=a(77183),c=a(18348);let m=({skill:e,onBack:t})=>{let a,{t:m,i18n:p}=(0,c.Bd)("gateway"),[u,g]=(0,i.useState)("overview"),[x,h]=(0,i.useState)(null),b=(e,t)=>{navigator.clipboard.writeText(e),h(t),setTimeout(()=>h(null),2e3)},f="github"===(a=e.source).source&&a.repo?`https://github.com/${a.repo}`:"git-subdir"===a.source&&a.url?a.path?`${a.url}/tree/main/${a.path}`:a.url:"url"===a.source&&a.url?a.url:null,_=(0,d.qF)(e),j=(0,d.Oy)(window.location.origin),y=[...e.category?[{property:m("skills.details.category"),value:e.category}]:[],...e.domain?[{property:m("skills.details.domain"),value:e.domain}]:[],...e.namespace?[{property:m("skills.details.namespace"),value:e.namespace}]:[],...e.version?[{property:m("skills.details.version"),value:e.version}]:[],...e.author?.name?[{property:m("skills.details.author"),value:e.author.name}]:[],...e.created_at?[{property:m("skills.details.added"),value:new Date(e.created_at).toLocaleDateString(p.language)}]:[]],v=[{key:"overview",label:m("skills.details.overview")},{key:"usage",label:m("skills.details.usage")}];return(0,s.jsxs)("div",{style:{padding:"24px 32px 24px 0"},children:[(0,s.jsxs)("div",{onClick:t,style:{display:"inline-flex",alignItems:"center",gap:6,color:"#5f6368",cursor:"pointer",fontSize:14,marginBottom:24},children:[(0,s.jsx)(l.A,{style:{fontSize:11}}),(0,s.jsx)("span",{children:m("skills.details.back")})]}),(0,s.jsxs)("div",{style:{marginBottom:8},children:[(0,s.jsx)("h1",{style:{fontSize:28,fontWeight:400,color:"#202124",margin:0,lineHeight:1.2},children:e.name}),e.description&&(0,s.jsx)("p",{style:{fontSize:14,color:"#5f6368",margin:"8px 0 0 0",lineHeight:1.6},children:e.description})]}),(0,s.jsx)("div",{style:{borderBottom:"1px solid #dadce0",marginBottom:28,marginTop:24},children:(0,s.jsx)("div",{style:{display:"flex",gap:0},children:v.map(e=>(0,s.jsx)("div",{onClick:()=>g(e.key),style:{padding:"12px 20px",fontSize:14,color:u===e.key?"#1a73e8":"#5f6368",borderBottom:u===e.key?"3px solid #1a73e8":"3px solid transparent",cursor:"pointer",fontWeight:u===e.key?500:400,marginBottom:-1},children:e.label},e.key))})}),"overview"===u&&(0,s.jsxs)("div",{style:{display:"flex",gap:64},children:[(0,s.jsxs)("div",{style:{flex:1,minWidth:0},children:[(0,s.jsx)("h2",{style:{fontSize:18,fontWeight:400,color:"#202124",margin:"0 0 4px 0"},children:m("skills.details.title")}),(0,s.jsx)("p",{style:{fontSize:13,color:"#5f6368",margin:"0 0 16px 0"},children:m("skills.details.subtitle")}),(0,s.jsxs)("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:14},children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{style:{borderBottom:"1px solid #dadce0"},children:[(0,s.jsx)("th",{style:{textAlign:"left",padding:"12px 0",color:"#5f6368",fontWeight:500,width:160},children:m("skills.details.property")}),(0,s.jsx)("th",{style:{textAlign:"left",padding:"12px 0",color:"#5f6368",fontWeight:500},children:e.name})]})}),(0,s.jsx)("tbody",{children:y.map((e,t)=>(0,s.jsxs)("tr",{style:{borderBottom:"1px solid #f1f3f4"},children:[(0,s.jsx)("td",{style:{padding:"12px 0",color:"#3c4043"},children:e.property}),(0,s.jsx)("td",{style:{padding:"12px 0",color:"#202124"},children:e.value})]},t))})]})]}),(0,s.jsxs)("div",{style:{width:240,flexShrink:0},children:[(0,s.jsxs)("div",{style:{marginBottom:24},children:[(0,s.jsx)("div",{style:{fontSize:12,color:"#5f6368",marginBottom:4},children:m("skills.details.status")}),(0,s.jsx)("span",{style:{fontSize:12,padding:"3px 10px",borderRadius:12,backgroundColor:e.enabled?"#e6f4ea":"#f1f3f4",color:e.enabled?"#137333":"#5f6368",fontWeight:500},children:m(e.enabled?"skills.details.public":"skills.details.draft")})]}),f&&(0,s.jsxs)("div",{style:{marginBottom:24},children:[(0,s.jsx)("div",{style:{fontSize:12,color:"#5f6368",marginBottom:4},children:m("skills.details.source")}),(0,s.jsxs)("a",{href:f,target:"_blank",rel:"noopener noreferrer",style:{fontSize:13,color:"#1a73e8",wordBreak:"break-all",display:"flex",alignItems:"center",gap:4},children:[f.replace("https://",""),(0,s.jsx)(r.A,{style:{fontSize:11,flexShrink:0}})]})]}),e.keywords&&e.keywords.length>0&&(0,s.jsxs)("div",{style:{marginBottom:24},children:[(0,s.jsx)("div",{style:{fontSize:12,color:"#5f6368",marginBottom:8},children:m("skills.details.tags")}),(0,s.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:6},children:e.keywords.map(e=>(0,s.jsx)("span",{style:{fontSize:12,padding:"4px 12px",borderRadius:16,border:"1px solid #dadce0",color:"#3c4043",backgroundColor:"#fff"},children:e},e))})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{style:{fontSize:12,color:"#5f6368",marginBottom:4},children:m("skills.details.id")}),(0,s.jsx)("div",{style:{fontSize:12,fontFamily:"monospace",color:"#3c4043",wordBreak:"break-all"},children:e.id})]})]})]}),"usage"===u&&(0,s.jsxs)("div",{style:{maxWidth:640},children:[(0,s.jsx)("h2",{style:{fontSize:18,fontWeight:400,color:"#202124",margin:"0 0 8px 0"},children:m("skills.details.using")}),(0,s.jsx)("p",{style:{fontSize:14,color:"#5f6368",margin:"0 0 24px 0",lineHeight:1.6},children:m("skills.details.usingHint")}),(0,s.jsxs)("div",{style:{border:"1px solid #dadce0",borderRadius:8,overflow:"hidden",marginBottom:24},children:[(0,s.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",backgroundColor:"#f8f9fa",borderBottom:"1px solid #dadce0"},children:[(0,s.jsx)("span",{style:{fontSize:13,color:"#3c4043",fontWeight:500},children:m("skills.details.run")}),(0,s.jsxs)("button",{onClick:()=>b(_,"install"),style:{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"install"===x?"#137333":"#1a73e8",background:"none",border:"none",cursor:"pointer",padding:0},children:["install"===x?(0,s.jsx)(n.A,{}):(0,s.jsx)(o.A,{}),m("install"===x?"skills.details.copied":"skills.details.copy")]})]}),(0,s.jsx)("pre",{style:{margin:0,padding:"14px 16px",fontSize:14,fontFamily:"monospace",color:"#202124",backgroundColor:"#fff"},children:_})]}),(0,s.jsxs)("p",{style:{fontSize:13,color:"#5f6368",lineHeight:1.6,margin:0},children:[m("skills.details.noMarketplace")," ",(0,s.jsx)("span",{onClick:()=>g("setup"),style:{color:"#1a73e8",cursor:"pointer"},children:m("skills.details.setupLink")})]})]}),"setup"===u&&(0,s.jsxs)("div",{style:{maxWidth:640},children:[(0,s.jsx)("h2",{style:{fontSize:18,fontWeight:400,color:"#202124",margin:"0 0 8px 0"},children:m("skills.details.setup")}),(0,s.jsx)("p",{style:{fontSize:14,color:"#5f6368",margin:"0 0 24px 0",lineHeight:1.6},children:m("skills.details.setupHint",{file:"~/.claude/settings.json"})}),(0,s.jsxs)("div",{style:{border:"1px solid #dadce0",borderRadius:8,overflow:"hidden"},children:[(0,s.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",backgroundColor:"#f8f9fa",borderBottom:"1px solid #dadce0"},children:[(0,s.jsx)("span",{style:{fontSize:13,color:"#3c4043",fontWeight:500},children:"~/.claude/settings.json"}),(0,s.jsxs)("button",{onClick:()=>b(j,"settings"),style:{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"settings"===x?"#137333":"#1a73e8",background:"none",border:"none",cursor:"pointer",padding:0},children:["settings"===x?(0,s.jsx)(n.A,{}):(0,s.jsx)(o.A,{}),m("settings"===x?"skills.details.copied":"skills.details.copy")]})]}),(0,s.jsx)("pre",{style:{margin:0,padding:"14px 16px",fontSize:13,fontFamily:"monospace",color:"#202124",backgroundColor:"#fff"},children:j})]})]})]})}},52682:(e,t,a)=>{a.d(t,{bb:()=>f,G_:()=>A,li:()=>v,SM:()=>N,rm:()=>y,JQ:()=>_});var s,i=a(20915);let l="/litellm-asset-prefix/_next/static/media/ai21.2713c853.svg",r="/litellm-asset-prefix/_next/static/media/anthropic.991679ea.svg";var n=a(75994),o=a(84927);let d="/litellm-asset-prefix/_next/static/media/cohere.6b48b6b4.svg";var c=a(59959),m=a(86032);let p="/litellm-asset-prefix/_next/static/media/mistral.a0b75906.svg",u="/litellm-asset-prefix/_next/static/media/ollama.9f08a95b.svg";var g=a(75532),x=a(91592);let h="/litellm-asset-prefix/_next/static/media/vllm.7451cca4.png",b="/litellm-asset-prefix/_next/static/media/watsonx.f4e4f480.svg";var f=((s={}).A2A_Agent="A2A Agent",s.AI21="Ai21",s.AI21_CHAT="Ai21 Chat",s.AIML="AI/ML API",s.AIOHTTP_OPENAI="Aiohttp Openai",s.Anthropic="Anthropic",s.ANTHROPIC_TEXT="Anthropic Text",s.AssemblyAI="AssemblyAI",s.AUTO_ROUTER="Auto Router",s.Bedrock="Amazon Bedrock",s.BedrockMantle="Amazon Bedrock Mantle",s.SageMaker="AWS SageMaker",s.Azure="Azure",s.Azure_AI_Studio="Azure AI Foundry (Studio)",s.AZURE_TEXT="Azure Text",s.BASETEN="Baseten",s.BYTEZ="Bytez",s.Cerebras="Cerebras",s.CLARIFAI="Clarifai",s.CLOUDFLARE="Cloudflare",s.CODESTRAL="Codestral",s.Cohere="Cohere",s.COHERE_CHAT="Cohere Chat",s.COMETAPI="Cometapi",s.COMPACTIFAI="Compactifai",s.Cursor="Cursor",s.Dashscope="Dashscope",s.Databricks="Databricks (Qwen API)",s.DATAROBOT="Datarobot",s.DeepInfra="DeepInfra",s.Deepgram="Deepgram",s.Deepseek="Deepseek",s.DOCKER_MODEL_RUNNER="Docker Model Runner",s.DOTPROMPT="Dotprompt",s.ElevenLabs="ElevenLabs",s.EMPOWER="Empower",s.FalAI="Fal AI",s.FEATHERLESS_AI="Featherless Ai",s.FireworksAI="Fireworks AI",s.FRIENDLIAI="Friendliai",s.GALADRIEL="Galadriel",s.GITHUB_COPILOT="Github Copilot",s.Google_AI_Studio="Google AI Studio",s.GradientAI="GradientAI",s.Groq="Groq",s.HEROKU="Heroku",s.Hosted_Vllm="vllm",s.HUGGINGFACE="Huggingface",s.HYPERBOLIC="Hyperbolic",s.Infinity="Infinity",s.JinaAI="Jina AI",s.LAMBDA_AI="Lambda Ai",s.LEMONADE="Lemonade",s.LLAMAFILE="Llamafile",s.LM_STUDIO="Lm Studio",s.LLAMA="Meta Llama",s.MARITALK="Maritalk",s.MiniMax="MiniMax",s.MistralAI="Mistral AI",s.MOONSHOT="Moonshot",s.MORPH="Morph",s.NEBIUS="Nebius",s.NLP_CLOUD="Nlp Cloud",s.NOVITA="Novita",s.NSCALE="Nscale",s.NVIDIA_NIM="Nvidia Nim",s.Ollama="Ollama",s.OLLAMA_CHAT="Ollama Chat",s.OOBABOOGA="Oobabooga",s.OpenAI="OpenAI",s.OPENAI_LIKE="Openai Like",s.OpenAI_Compatible="OpenAI-Compatible Chat Completions (Together AI, vLLM, etc.)",s.OpenAI_Text="OpenAI Text Completion",s.OpenAI_Text_Compatible="OpenAI-Compatible Completions (legacy /v1/completions)",s.Openrouter="Openrouter",s.Oracle="Oracle Cloud Infrastructure (OCI)",s.OVHCLOUD="Ovhcloud",s.Perplexity="Perplexity",s.PETALS="Petals",s.PG_VECTOR="Pg Vector",s.PREDIBASE="Predibase",s.RECRAFT="Recraft",s.REPLICATE="Replicate",s.RunwayML="RunwayML",s.SAGEMAKER_LEGACY="Sagemaker",s.Sambanova="Sambanova",s.SAP="SAP Generative AI Hub",s.Snowflake="Snowflake",s.Soniox="Soniox",s.TEXT_COMPLETION_CODESTRAL="Text-Completion-Codestral",s.TogetherAI="TogetherAI",s.TOPAZ="Topaz",s.Triton="Triton",s.V0="V0",s.VERCEL_AI_GATEWAY="Vercel Ai Gateway",s.Vertex_AI="Vertex AI (Anthropic, Gemini, etc.)",s.VERTEX_AI_BETA="Vertex Ai Beta",s.VLLM="Vllm",s.VolcEngine="VolcEngine",s.Voyage="Voyage AI",s.WANDB="Wandb",s.WATSONX="Watsonx",s.WATSONX_TEXT="Watsonx Text",s.xAI="xAI",s.XINFERENCE="Xinference",s.ZAI="Z.AI (Zhipu AI)",s);let _={A2A_Agent:"a2a_agent",AI21:"ai21",AI21_CHAT:"ai21_chat",AIML:"aiml",AIOHTTP_OPENAI:"aiohttp_openai",Anthropic:"anthropic",ANTHROPIC_TEXT:"anthropic_text",AssemblyAI:"assemblyai",AUTO_ROUTER:"auto_router",Azure:"azure",Azure_AI_Studio:"azure_ai",AZURE_TEXT:"azure_text",BASETEN:"baseten",Bedrock:"bedrock",BedrockMantle:"bedrock_mantle",BYTEZ:"bytez",Cerebras:"cerebras",CLARIFAI:"clarifai",CLOUDFLARE:"cloudflare",CODESTRAL:"codestral",Cohere:"cohere",COHERE_CHAT:"cohere_chat",COMETAPI:"cometapi",COMPACTIFAI:"compactifai",Cursor:"cursor",Dashscope:"dashscope",Databricks:"databricks",DATAROBOT:"datarobot",DeepInfra:"deepinfra",Deepgram:"deepgram",Deepseek:"deepseek",DOCKER_MODEL_RUNNER:"docker_model_runner",DOTPROMPT:"dotprompt",ElevenLabs:"elevenlabs",EMPOWER:"empower",FalAI:"fal_ai",FEATHERLESS_AI:"featherless_ai",FireworksAI:"fireworks_ai",FRIENDLIAI:"friendliai",GALADRIEL:"galadriel",GITHUB_COPILOT:"github_copilot",Google_AI_Studio:"gemini",GradientAI:"gradient_ai",Groq:"groq",HEROKU:"heroku",Hosted_Vllm:"hosted_vllm",HUGGINGFACE:"huggingface",HYPERBOLIC:"hyperbolic",Infinity:"infinity",JinaAI:"jina_ai",LAMBDA_AI:"lambda_ai",LEMONADE:"lemonade",LLAMAFILE:"llamafile",LLAMA:"meta_llama",LM_STUDIO:"lm_studio",MARITALK:"maritalk",MiniMax:"minimax",MistralAI:"mistral",MOONSHOT:"moonshot",MORPH:"morph",NEBIUS:"nebius",NLP_CLOUD:"nlp_cloud",NOVITA:"novita",NSCALE:"nscale",NVIDIA_NIM:"nvidia_nim",Ollama:"ollama",OLLAMA_CHAT:"ollama_chat",OOBABOOGA:"oobabooga",OpenAI:"openai",OPENAI_LIKE:"openai_like",OpenAI_Compatible:"openai",OpenAI_Text:"text-completion-openai",OpenAI_Text_Compatible:"text-completion-openai",Openrouter:"openrouter",Oracle:"oci",OVHCLOUD:"ovhcloud",Perplexity:"perplexity",PETALS:"petals",PG_VECTOR:"pg_vector",PREDIBASE:"predibase",RECRAFT:"recraft",REPLICATE:"replicate",RunwayML:"runwayml",SAGEMAKER_LEGACY:"sagemaker",SageMaker:"sagemaker_chat",Sambanova:"sambanova",SAP:"sap",Snowflake:"snowflake",Soniox:"soniox",TEXT_COMPLETION_CODESTRAL:"text-completion-codestral",TogetherAI:"together_ai",TOPAZ:"topaz",Triton:"triton",V0:"v0",VERCEL_AI_GATEWAY:"vercel_ai_gateway",Vertex_AI:"vertex_ai",VERTEX_AI_BETA:"vertex_ai_beta",VLLM:"vllm",VolcEngine:"volcengine",Voyage:"voyage",WANDB:"wandb",WATSONX:"watsonx",WATSONX_TEXT:"watsonx_text",xAI:"xai",XINFERENCE:"xinference",ZAI:"zai"},j=new Set(["bedrock_mantle"]),y={"A2A Agent":"/litellm-asset-prefix/_next/static/media/a2a_agent.b800eafb.png",Ai21:l,"Ai21 Chat":l,"AI/ML API":"/litellm-asset-prefix/_next/static/media/aiml_api.17e2574f.svg","Aiohttp Openai":g.A.src,Anthropic:r,"Anthropic Text":r,AssemblyAI:"/litellm-asset-prefix/_next/static/media/assemblyai_small.91fc8ddb.png",Azure:m.A.src,"Azure AI Foundry (Studio)":m.A.src,"Azure Text":m.A.src,Baseten:"/litellm-asset-prefix/_next/static/media/baseten.3297a23e.svg","Amazon Bedrock":n.A.src,"Amazon Bedrock Mantle":n.A.src,"AWS SageMaker":n.A.src,Cerebras:"/litellm-asset-prefix/_next/static/media/cerebras.4028acc0.svg",Cloudflare:o.A.src,Codestral:p,Cohere:d,"Cohere Chat":d,Cometapi:"/litellm-asset-prefix/_next/static/media/cometapi.1906df8e.svg",Cursor:"/litellm-asset-prefix/_next/static/media/cursor.2b9e206d.svg","Databricks (Qwen API)":"/litellm-asset-prefix/_next/static/media/databricks.3fa43b33.svg",Dashscope:"/litellm-asset-prefix/_next/static/media/qwen.9d199b1a.png",Deepseek:"/litellm-asset-prefix/_next/static/media/deepseek.af4beb58.svg",Deepgram:"/litellm-asset-prefix/_next/static/media/deepgram.e2a6e0e2.png",DeepInfra:"/litellm-asset-prefix/_next/static/media/deepinfra.5999bb22.png",ElevenLabs:"/litellm-asset-prefix/_next/static/media/elevenlabs.47a8117d.png","Fal AI":"/litellm-asset-prefix/_next/static/media/fal_ai.79bb51bc.jpg","Featherless Ai":"/litellm-asset-prefix/_next/static/media/featherless.a1166990.svg","Fireworks AI":"/litellm-asset-prefix/_next/static/media/fireworks.521743f2.svg",Friendliai:"/litellm-asset-prefix/_next/static/media/friendli.a8b352e0.svg","Github Copilot":"/litellm-asset-prefix/_next/static/media/github_copilot.2dd910eb.svg","Google AI Studio":c.A.src,Groq:"/litellm-asset-prefix/_next/static/media/groq.a48aa7e9.svg",vllm:h,Huggingface:"/litellm-asset-prefix/_next/static/media/huggingface.9677d8e9.svg",Hyperbolic:"/litellm-asset-prefix/_next/static/media/hyperbolic.27809216.svg",Infinity:"/litellm-asset-prefix/_next/static/media/infinity.ae8c65fe.png","Jina AI":"/litellm-asset-prefix/_next/static/media/jina.4cec304d.png","Lambda Ai":"/litellm-asset-prefix/_next/static/media/lambda.79b0284a.svg","Lm Studio":"/litellm-asset-prefix/_next/static/media/lmstudio.ba91a264.svg","Meta Llama":"/litellm-asset-prefix/_next/static/media/meta_llama.d861afe9.svg",MiniMax:"/litellm-asset-prefix/_next/static/media/minimax.39d7a8c8.svg","Mistral AI":p,Moonshot:"/litellm-asset-prefix/_next/static/media/moonshot.f82091e8.svg",Morph:"/litellm-asset-prefix/_next/static/media/morph.9f386ae2.svg",Nebius:"/litellm-asset-prefix/_next/static/media/nebius.f32af5e1.svg",Novita:"/litellm-asset-prefix/_next/static/media/novita.5093ae70.svg","Nvidia Nim":"/litellm-asset-prefix/_next/static/media/nvidia_nim.3622bf04.svg",Ollama:u,"Ollama Chat":u,Oobabooga:g.A.src,OpenAI:g.A.src,"Openai Like":g.A.src,"OpenAI Text Completion":g.A.src,"OpenAI-Compatible Completions (legacy /v1/completions)":g.A.src,"OpenAI-Compatible Chat Completions (Together AI, vLLM, etc.)":g.A.src,Openrouter:"/litellm-asset-prefix/_next/static/media/openrouter.d97240cb.svg","Oracle Cloud Infrastructure (OCI)":"/litellm-asset-prefix/_next/static/media/oracle.b5562a07.svg",Perplexity:"/litellm-asset-prefix/_next/static/media/perplexity-ai.8b473154.svg",Recraft:"/litellm-asset-prefix/_next/static/media/recraft.a6a1c0df.svg",Replicate:"/litellm-asset-prefix/_next/static/media/replicate.9257eaed.svg",RunwayML:"/litellm-asset-prefix/_next/static/media/runway.ad364a99.png",Sagemaker:n.A.src,Sambanova:"/litellm-asset-prefix/_next/static/media/sambanova.2afd68a7.svg","SAP Generative AI Hub":"/litellm-asset-prefix/_next/static/media/sap.557d85ef.png",Snowflake:x.A.src,Soniox:"/litellm-asset-prefix/_next/static/media/soniox.8d2626ff.svg","Text-Completion-Codestral":p,TogetherAI:"/litellm-asset-prefix/_next/static/media/togetherai.773d2487.svg",Topaz:"/litellm-asset-prefix/_next/static/media/topaz.6ad1c5d5.svg",Triton:"/litellm-asset-prefix/_next/static/media/nvidia_triton.5de83ed2.png",V0:"/litellm-asset-prefix/_next/static/media/v0.f9439671.svg","Vercel Ai Gateway":"/litellm-asset-prefix/_next/static/media/vercel.51bcdd36.svg","Vertex AI (Anthropic, Gemini, etc.)":c.A.src,"Vertex Ai Beta":c.A.src,Vllm:h,VolcEngine:"/litellm-asset-prefix/_next/static/media/volcengine.124cdc6f.png","Voyage AI":"/litellm-asset-prefix/_next/static/media/voyage.16a6c024.webp",Watsonx:b,"Watsonx Text":b,xAI:"/litellm-asset-prefix/_next/static/media/xai.2f55916d.svg",Xinference:"/litellm-asset-prefix/_next/static/media/xinference.adbf22a6.svg"},v=e=>{if(!e)return{logo:"",displayName:"-"};if("gemini"===e.toLowerCase()){let e="Google AI Studio";return{logo:(0,i.s)(y[e])??"",displayName:e}}let t=Object.keys(_).find(t=>_[t].toLowerCase()===e.toLowerCase())??Object.keys(_).find(t=>t.toLowerCase()===e.toLowerCase());if(!t)return{logo:"",displayName:e};let a=f[t];return{logo:(0,i.s)(y[a])??"",displayName:a}},A=e=>{if("AI/ML API"===e)return"aiml/flux-pro/v1.1";if("Vertex AI (Anthropic, Gemini, etc.)"===e)return"gemini-pro";if("Anthropic"==e)return"claude-3-opus";if("Amazon Bedrock"==e)return"claude-3-opus";if("AWS SageMaker"==e)return"sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b";else if("Google AI Studio"==e)return"gemini-pro";else if("Azure AI Foundry (Studio)"==e)return"azure_ai/command-r-plus";else if("Azure"==e)return"my-deployment";else if("Oracle Cloud Infrastructure (OCI)"==e)return"oci/xai.grok-4";else if("Snowflake"==e)return"snowflake/mistral-7b";else if("Voyage AI"==e)return"voyage/";else if("Jina AI"==e)return"jina_ai/";else if("VolcEngine"==e)return"volcengine/<any-model-on-volcengine>";else if("DeepInfra"==e)return"deepinfra/<any-model-on-deepinfra>";else if("Fal AI"==e)return"fal_ai/fal-ai/flux-pro/v1.1-ultra";else if("RunwayML"==e)return"runwayml/gen4_turbo";else if("Watsonx"===e)return"watsonx/ibm/granite-3-3-8b-instruct";else if("Cursor"===e)return"cursor/claude-4-sonnet";else if("Z.AI (Zhipu AI)"===e)return"zai/glm-4.5";else return"gpt-3.5-turbo"},N=(e,t)=>{let a=_[e],s=[];return e&&"object"==typeof t&&(Object.entries(t).forEach(([e,t])=>{if(null!==t&&"object"==typeof t&&"litellm_provider"in t){let i=t.litellm_provider,l="string"==typeof i&&(i.startsWith(`${a}_`)||i.startsWith(`${a}-`));(i===a||l&&!j.has(i))&&s.push(e)}}),"Cohere"==e&&Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"cohere_chat"===t.litellm_provider&&s.push(e)}),"AWS SageMaker"==e&&Object.entries(t).forEach(([e,t])=>{null!==t&&"object"==typeof t&&"litellm_provider"in t&&"sagemaker_chat"===t.litellm_provider&&s.push(e)})),s}},59959:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/google.ae4e5623.svg",height:16,width:16,blurWidth:0,blurHeight:0}},68764:(e,t,a)=>{a.d(t,{sx:()=>r,yz:()=>o});var s,i,l=((s={}).AUDIO_SPEECH="audio_speech",s.AUDIO_TRANSCRIPTION="audio_transcription",s.IMAGE_GENERATION="image_generation",s.VIDEO_GENERATION="video_generation",s.CHAT="chat",s.RESPONSES="responses",s.IMAGE_EDITS="image_edits",s.ANTHROPIC_MESSAGES="anthropic_messages",s.EMBEDDING="embedding",s),r=((i={}).IMAGE="image",i.VIDEO="video",i.CHAT="chat",i.RESPONSES="responses",i.IMAGE_EDITS="image_edits",i.ANTHROPIC_MESSAGES="anthropic_messages",i.EMBEDDINGS="embeddings",i.SPEECH="speech",i.TRANSCRIPTION="transcription",i.A2A_AGENTS="a2a_agents",i.MCP="mcp",i.REALTIME="realtime",i.INTERACTIONS="interactions",i);let n={image_generation:"image",video_generation:"video",chat:"chat",responses:"responses",image_edits:"image_edits",anthropic_messages:"anthropic_messages",audio_speech:"speech",audio_transcription:"transcription",embedding:"embeddings"},o=e=>Object.values(l).includes(e)?n[e]:"chat"},75532:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/openai_small.69010ad4.svg",height:28,width:28,blurWidth:0,blurHeight:0}},75994:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/bedrock.4c3ae7ad.svg",height:16,width:16,blurWidth:0,blurHeight:0}},77183:(e,t,a)=>{a.d(t,{AY:()=>j,B9:()=>_,Fn:()=>f,MT:()=>u,Oy:()=>g,Qx:()=>y,VN:()=>h,qF:()=>x,sI:()=>l,vt:()=>b});let s=/^[a-zA-Z0-9][a-zA-Z0-9._-]*(\/[a-zA-Z0-9][a-zA-Z0-9._-]*)*$/,i=e=>e.trim().replace(/\/+$/,""),l=e=>{let t=i(e);return""!==t&&s.test(t)},r=/\.(md|markdown|txt|json|ya?ml|toml)$/i,n=/^\d{1,3}(\.\d{1,3}){3}$/,o=/^[A-Za-z0-9-]+$/,d=/^[A-Za-z0-9._-]+$/,c=e=>e.pathname.split("/").filter(e=>""!==e),m=e=>{let t=e.split("/").filter(e=>""!==e);return t[t.length-1]??""},p=e=>e.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,""),u=(e,t)=>{let a=(e=>{let t,a=e.trim();if(""===a||a.startsWith("//"))return null;let s=/^[a-z][a-z0-9+.-]*:\/\//i.test(a)?a:`https://${a}`;try{t=new URL(s)}catch{return null}return"https:"!==t.protocol||""!==t.username||""!==t.password||!t.hostname.includes(".")||t.hostname.startsWith("[")||n.test(t.hostname)?null:t})(e);if(!a)return null;if("github.com"===a.hostname.replace(/^www\./,""))return((e,t)=>{let a=c(e);if(a.length<2)return null;let l=a[0],n=a[1].replace(/\.git$/,"");if(!o.test(l)||!d.test(n))return null;let u=`${l}/${n}`,g=`https://github.com/${u}`,x={parsed:{source:"github",repo:u},label:`GitHub repo — ${u}`,suggestedName:p(n)};if(a.length>=4&&("tree"===a[2]||"blob"===a[2])){let e=a.slice(4),t=m(e.join("/")),l=r.test(t)?e.slice(0,-1):e;if(0===l.length)return x;let n=i(l.join("/"));return s.test(n)?{parsed:{source:"git-subdir",url:g,path:n},label:`GitHub subdir — ${u} @ ${n}`,suggestedName:p(m(n))}:null}if(2!==a.length)return null;let h=i(t??"");return""!==h?s.test(h)?{parsed:{source:"git-subdir",url:g,path:h},label:`GitHub subdir — ${u} @ ${h}`,suggestedName:p(m(h))}:null:x})(a,t);if(c(a).length<2)return null;let l=`${a.protocol}//${a.host}${a.pathname.replace(/\/+$/,"")}`,u=i(t??"");return""!==u?s.test(u)?{parsed:{source:"git-subdir",url:l,path:u},label:`Git subdir — ${l} @ ${u}`,suggestedName:p(m(u))}:null:{parsed:{source:"url",url:l},label:`Git repo — ${l}`,suggestedName:p(m(a.pathname).replace(/\.git$/,""))}},g=e=>JSON.stringify({extraKnownMarketplaces:{"my-org":{source:{source:"url",url:`${e}/claude-code/marketplace.json`}}}},null,2),x=e=>{let{source:t}=e;return"github"===t.source&&t.repo?`/plugin marketplace add ${t.repo}`:("url"===t.source||"git-subdir"===t.source)&&t.url?`/plugin marketplace add ${t.url}`:`/plugin marketplace add ${e.name}`},h=e=>!!e&&""!==e.trim()&&/^[a-z0-9-]+$/.test(e),b=e=>{if(!e)return"gray";let t=e.toLowerCase();if(t.includes("development")||t.includes("dev"))return"blue";if(t.includes("productivity")||t.includes("workflow"))return"green";if(t.includes("learning")||t.includes("education"))return"purple";if(t.includes("security")||t.includes("safety"))return"red";if(t.includes("data")||t.includes("analytics"))return"orange";else if(t.includes("integration")||t.includes("api"))return"yellow";return"gray"},f=e=>!e||/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(e),_=e=>!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),j=e=>{if(!e)return!0;try{return new URL(e),!0}catch{return!1}},y=e=>e&&""!==e.trim()?e.split(",").map(e=>e.trim()).filter(e=>""!==e):[]},83433:(e,t,a)=>{a.d(t,{EY:()=>i.A,Zp:()=>s.A,hE:()=>l.A});var s=a(90307),i=a(70006),l=a(43654)},84927:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/cloudflare.2bc2b38c.svg",height:16,width:16,blurWidth:0,blurHeight:0}},86032:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/microsoft_azure.e0fb1d5e.svg",height:58,width:200,blurWidth:0,blurHeight:0}},91592:(e,t,a)=>{a.d(t,{A:()=>s});let s={src:"/litellm-asset-prefix/_next/static/media/snowflake.a7deda5d.svg",height:139,width:146,blurWidth:0,blurHeight:0}}}]);