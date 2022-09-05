(this["webpackJsonpsuckless-time-tracker"]=this["webpackJsonpsuckless-time-tracker"]||[]).push([[0],{12:function(e,t,n){"use strict";n.d(t,"a",(function(){return f})),n.d(t,"b",(function(){return m}));var r=n(4),a=n(8),c=n(0),i=n.n(c),s=n(5),u=n(1);function o(){var e,t=window.localStorage.getItem("sync");return t?(e=t,JSON.parse(e)):(l(null),null)}function l(e){window.localStorage.setItem("sync",function(e){return JSON.stringify(e)}(e))}var d=i.a.createContext({status:"off"});function f(e){var t=e.children,n=i.a.useState(o),a=Object(r.a)(n,1)[0];return null!==a?Object(u.jsx)(v,{initSync:a,children:t}):Object(u.jsx)(d.Provider,{value:{status:"off"},children:t})}function v(e){var t=e.initSync,n=e.children,c=Object(s.d)(),o=c.state,f=c.updateState,v=i.a.useRef(o),m=i.a.useRef(t),b=i.a.useRef(null),j=i.a.useState("off"),h=Object(r.a)(j,2),O=h[0],k=h[1],g=i.a.useRef(new Date),w=i.a.useRef(!0),p=i.a.useRef((function(){var e;w.current&&(k("syncing"),(e=m.current,fetch("".concat(e.storageUrl,"/string"),{method:"GET",headers:{Authorization:"Bearer ".concat(e.authToken)}}).catch((function(e){throw new Error("Request to get app state failed")})).then((function(e){if(200===e.status)return e.text().then((function(e){var t=e.indexOf("\n");return[Number(e.substring(0,t)),Object(s.b)(e.substring(t+1))]}));if(401===e.status)throw new Error("Unauthorized. Check authToken.");if(404===e.status)return null;throw new Error("Unexpected response status ".concat(e.status))}))).then((function(e){if(w.current&&e){var t=Object(r.a)(e,2),n=t[0],a=t[1];if(m.current.saving&&(m.current.saving=!1,m.current.version+=1,m.current.version>n&&(m.current.dirty=!0,m.current.version-=1)),m.current.version>n)throw new Error("Server is behind client. Either a bug or storage rollback.");if(m.current.version===n);else{if(!(m.current.version<n)||m.current.dirty)throw new Error("State is dirty and can not be fast-forwarded.");m.current.version=n,v.current=a,f((function(){return a}))}}})).then((function(){var e,t;w.current&&(l(m.current),b.current=y(),m.current.dirty?(null===(e=b.current)||void 0===e||e.call(b),null===(t=b.current)||void 0===t||t.flush()):k("synced"))})).catch((function(e){w.current&&(k("error"),console.error("Initializing sync failed."),console.error(e))})))}));function y(){return Object(a.debounce)((function(){var e;if(w.current)return null===(e=b.current)||void 0===e||e.cancel(),b.current=null,m.current.saving=!0,m.current.dirty=!1,l(m.current),k("syncing"),function(e,t){return fetch("".concat(t.storageUrl,"/string/").concat(t.version+1),{method:"PUT",body:Object(s.c)(e),headers:{Authorization:"Bearer ".concat(t.authToken)}}).catch((function(e){throw new Error("Request to store app state failed")})).then((function(e){if(200===e.status)return t.version+1;throw 401===e.status?new Error("Unauthorized. Check authToken."):409===e.status?new Error("Conflict detected. You will have to resolve it manually."):new Error("Unexpected response status ".concat(e.status))}))}(v.current,m.current).then((function(e){var t;w.current&&(m.current.saving=!1,m.current.version=e,l(m.current),b.current=y(),m.current.dirty?(null===(t=b.current)||void 0===t||t.call(b),k("dirty")):k("synced"))})).catch((function(e){if(w.current){var t,n=m.current.dirty;if(m.current.saving=!1,m.current.dirty=!0,l(m.current),console.error("Failed to send state to server."),console.error(e),b.current=y(),n)null===(t=b.current)||void 0===t||t.call(b),k("dirty");else k("error")}}))}),1e3,{trailing:!0,leading:!1})}return i.a.useEffect((function(){var e;o!==v.current&&(v.current=o,m.current.dirty||(m.current.dirty=!0,l(m.current),null!==b.current&&k("dirty")),null===(e=b.current)||void 0===e||e.call(b))}),[o]),i.a.useEffect((function(){var e=function(){null!==b.current&&(b.current.cancel(),b.current=null,p.current(),g.current=new Date)};return window.addEventListener("focus",e),function(){return window.removeEventListener("focus",e)}}),[]),i.a.useEffect((function(){var e=window.setInterval((function(){var e=new Date;null!==b.current&&e.getTime()-g.current.getTime()>12e4&&(b.current.cancel(),b.current=null,p.current(),g.current=e)}),5e3);return function(){return window.clearInterval(e)}}),[]),i.a.useEffect((function(){return p.current(),function(){var e;w.current=!1,null===(e=b.current)||void 0===e||e.cancel(),b.current=null}}),[]),Object(u.jsx)(d.Provider,{value:{status:O},children:n})}function m(){return i.a.useContext(d)}},20:function(e,t,n){"use strict";t.a=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,38)).then((function(t){var n=t.getCLS,r=t.getFID,a=t.getFCP,c=t.getLCP,i=t.getTTFB;n(e),r(e),a(e),c(e),i(e)}))}},21:function(e,t,n){"use strict";n.d(t,"a",(function(){return N}));var r=n(4),a=n(0),c=n.n(a),i=n(10),s=n(2),u=n(3),o=n(13),l=n(5),d=n(9);function f(e){return Object.fromEntries(e.map((function(e){return[e.id,e]})))}function v(){for(var e="",t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];return n.forEach((function(t){!1!==t&&(e=e+" "+t)})),e}function m(e){if(!e)throw console.error("assertion failed!"),console.trace(),new Error("assertion failed")}n(29);var b=n(1);function j(e){var t,n=e.task,r=e.active,a=e.timeSpent,c=e.onActiveChange,i=e.onEstimationChange,s=e.onNameChange,u=e.onDelete,o=e.innerRef,l=null;if(null!==n.estimation){var d,f=a.as("hours")/7,m=f/n.estimation;d=m<.5?"ok":m<.7?"worse":m<.9?"bad":"critical",l=Object(b.jsxs)("span",{children:["Time:"," ",Object(b.jsx)("progress",{className:v(d),value:Math.min(m,1),title:"".concat(f.toFixed(1)," of ").concat(n.estimation," man days"),max:"1"})]})}return Object(b.jsxs)("div",{className:v("task",r&&"active"),onClick:(t=function(){c(!r)},function(e){e.target===e.currentTarget&&t(e)}),ref:o,children:[Object(b.jsx)("div",{children:Object(b.jsx)("textarea",{className:"name",value:n.name,onChange:function(e){s(e.target.value)}})}),Object(b.jsxs)("div",{children:["Estimation: ",Object(b.jsx)("button",{type:"button",className:"button minus",onClick:function(){i((n.estimation||1)-1||null)},children:"-"})," ",Object(b.jsx)("input",{className:"estimation",min:"1",step:"1",type:"number",value:n.estimation||"",onChange:function(e){i(Number(e.target.value)||null)}})," ",Object(b.jsx)("button",{type:"button",className:"button plus",onClick:function(){i((n.estimation||0)+1)},children:"+"})," ",l," ",Object(b.jsx)("button",{type:"button",className:"button",onClick:function(){return window.confirm("You sure?")&&u()},children:"Delete"})]})]},n.id)}var h=n(12);n(30);function O(){var e=Object(l.d)(),t=e.state,n=e.updateState,a=Object(h.b)().status,v=c.a.useState(""),O=Object(r.a)(v,2),k=O[0],g=O[1],w=c.a.useMemo((function(){return f(t.tasks)}),[t.tasks]),p=c.a.useMemo((function(){return function(e){var t,n={},r=Object(d.a)(e);try{for(r.s();!(t=r.n()).done;){var a=t.value;n[a.taskId]?n[a.taskId].push(a):n[a.taskId]=[a]}}catch(c){r.e(c)}finally{r.f()}return n}(t.events)}),[t.events]),y=function(e){return function(t){m(void 0!==w[e]),m(!1===w[e].deleted),n((function(n){return Object(s.a)(Object(s.a)({},n),{},{tasks:n.tasks.map((function(n){return n.id!==e?n:Object(s.a)(Object(s.a)({},n),{},{estimation:t})}))})}))}},x=function(e){return function(t){m(void 0!==w[e]),m(!1===w[e].deleted),n((function(n){if(t){m(n.activeTask!==e);var r=Object(i.a)(n.events);return null!==n.activeTask&&(m(r.length>0),m(null===r[r.length-1].end_time),r[r.length-1]=Object(s.a)(Object(s.a)({},r[r.length-1]),{},{end_time:u.DateTime.local()})),r.push({taskId:e,start_time:u.DateTime.local(),end_time:null}),Object(s.a)(Object(s.a)({},n),{},{activeTask:e,events:r})}m(n.activeTask===e);var a=Object(i.a)(n.events);return m(a.length>0),m(null===a[a.length-1].end_time),a[a.length-1]=Object(s.a)(Object(s.a)({},a[a.length-1]),{},{end_time:u.DateTime.local()}),Object(s.a)(Object(s.a)({},n),{},{activeTask:null,events:a})}))}},N=function(e){return function(){m(void 0!==w[e]),m(!1===w[e].deleted),n((function(t){var n,r;return t.activeTask===e?(m((n=Object(i.a)(t.events)).length>0),m(null===n[n.length-1].end_time),n[n.length-1]=Object(s.a)(Object(s.a)({},n[n.length-1]),{},{end_time:u.DateTime.local()}),r=null):(n=t.events,r=t.activeTask),Object(s.a)(Object(s.a)({},t),{},{tasks:t.tasks.map((function(t){return t.id!==e?t:Object(s.a)(Object(s.a)({},t),{},{deleted:!0})})),activeTask:r,events:n})}))}},E=t.tasks.filter((function(e){return!e.deleted})).filter((function(e){return""===k.trim()||e.name.includes(k.trim())})),S=E.map((function(e,r){var a=e.id===t.activeTask,c=function(e){var t=u.Duration.fromObject({seconds:0});return e.forEach((function(e){t=t.plus((e.end_time||u.DateTime.local()).diff(e.start_time))})),t}(p[e.id]||[]);return Object(b.jsx)(o.b,{draggableId:String(e.id),index:r,children:function(t){return Object(b.jsx)("div",{style:{padding:"2.5px 5px"},children:Object(b.jsx)("div",Object(s.a)(Object(s.a)(Object(s.a)({},t.draggableProps),t.dragHandleProps),{},{ref:t.innerRef,children:Object(b.jsx)(j,{task:e,active:a,timeSpent:c,onNameChange:(r=e.id,function(e){m(void 0!==w[r]),m(!1===w[r].deleted),n((function(t){return Object(s.a)(Object(s.a)({},t),{},{tasks:t.tasks.map((function(t){return t.id!==r?t:Object(s.a)(Object(s.a)({},t),{},{name:e})}))})}))}),onEstimationChange:y(e.id),onActiveChange:x(e.id),onDelete:N(e.id)})}))});var r}},e.id)}));return Object(b.jsxs)("div",{children:[Object(b.jsxs)("div",{className:"tasks-bar",children:[Object(b.jsx)("button",{type:"button",className:"button plus",onClick:function(){n((function(e){var t=Math.floor(1e9*Math.random());return Object(s.a)(Object(s.a)({},e),{},{tasks:[{id:t,name:"",estimation:null,deleted:!1}].concat(Object(i.a)(e.tasks))})})),window.setTimeout((function(){var e;null===(e=document.querySelector(".task .name"))||void 0===e||e.focus()}),1)},children:"+"})," ",Object(b.jsx)("input",{type:"text",value:k,placeholder:"Search...",onChange:function(e){g(e.target.value)}})," ",Object(b.jsx)("button",{type:"button",className:"button plus",onClick:function(){return alert("\nGood day!\n\nThis is a small app for time tracking. It's serverless, meaning all data is stored on your device, in local storage*. As you can see, it's pretty basic and not well tested. Probably works only on Firefox. Use it at your own risk.\n\n* You can enable syncing through a self-hosted backend, more on that in README.md at https://github.com/prk3/suckless-time-tracker.\n\nsuckless-time-tracker 0.4.0")},children:"?"})," ",Object(b.jsx)("span",{className:"sync-indicator sync-indicator-"+a,title:a,children:"\u25cf"})]}),Object(b.jsx)(o.a,{onDragEnd:function(e,t){var a=e.source,c=e.destination;"DROP"===e.reason&&void 0!==c&&n((function(e){var t=e.tasks.findIndex((function(e){return e===E[a.index]})),n=e.tasks.findIndex((function(e){return e===E[c.index]})),u=Object(i.a)(e.tasks),o=u.splice(t,1),l=Object(r.a)(o,1)[0];return u.splice(n,0,l),Object(s.a)(Object(s.a)({},e),{},{tasks:u})}))},children:Object(b.jsx)(o.c,{droppableId:"tasks",children:function(e){return Object(b.jsxs)("div",Object(s.a)(Object(s.a)({},e.droppableProps),{},{ref:e.innerRef,children:[S,e.placeholder]}))}})})]})}function k(e){var t=Math.floor(e.as("minutes"));return t<60?"".concat(t,"m"):t%60===0?"".concat(Math.floor(t/60),"h"):"".concat(Math.floor(t/60),"h").concat(t%60,"m")}function g(e){var t=e.startOfWeek,n=Object(l.d)().state,a=c.a.useMemo((function(){return f(n.tasks)}),[n.tasks]),i=c.a.useMemo((function(){return function(e,t){var n=t.endOf("week");return e.filter((function(e){return e.start_time>=t&&e.start_time<=n}))}(n.events,t)}),[n.events,t]),s=function(e){var t,n=[{},{},{},{},{},{},{}],r=Object(d.a)(e);try{for(r.s();!(t=r.n()).done;){var a,c,i=t.value,s=n[i.start_time.weekday-1],o=(i.end_time||u.DateTime.local()).diff(i.start_time);s[i.taskId]=null!==(a=null===(c=s[i.taskId])||void 0===c?void 0:c.plus(o))&&void 0!==a?a:o}}catch(l){r.e(l)}finally{r.f()}return n}(i);return Object(b.jsx)("div",{className:"week-view",children:s.map((function(e,n){return Object(b.jsxs)("div",{className:"week-day",children:[Object(b.jsx)("div",{className:"week-day-name",children:t.plus({days:n}).toFormat("cccc")},"day"),Object.entries(e).map((function(e){var t=Object(r.a)(e,2),n=t[0],c=t[1];return Object(b.jsxs)("div",{className:"week-task-log",children:[Object(b.jsx)("div",{className:"week-task-log-name",children:a[n].name}),Object(b.jsx)("div",{className:"week-task-log-time",children:k(c)})]},n)})),Object.keys(e).length>0?Object(b.jsx)("div",{className:"week-task-summary",children:k(Object.values(e).reduce((function(e,t){return e.plus(t)})))}):null]},t.toString()+" "+n)}))})}var w=n(8);function p(e){var t=Math.floor(e.as("minutes"));return t<60?"".concat(t,"m"):t%60===0?"".concat(Math.floor(t/60),"h"):"".concat(Math.floor(t/60),"h").concat(t%60,"m")}function y(e){var t=e.startOfWeek,n=Object(l.d)().state,r=c.a.useMemo((function(){return f(n.tasks)}),[n.tasks]),a=c.a.useMemo((function(){return function(e,t){var n=t.endOf("week");return e.filter((function(e){return e.start_time>=t&&e.start_time<=n}))}(n.events,t)}),[n.events,t]),i=function(e){var t,n=[[],[],[],[],[],[],[]],r=Object(d.a)(e);try{for(r.s();!(t=r.n()).done;){var a=t.value;n[a.start_time.weekday-1].push(a)}}catch(c){r.e(c)}finally{r.f()}return n}(a);return Object(b.jsxs)("div",{className:"week-timeline-container",children:[Object(b.jsx)("div",{children:Object(w.range)(0,25).map((function(e){return Object(b.jsx)("div",{className:"hour-line",children:e},e)}))}),Object(b.jsx)("div",{className:"week-view week-timeline-view",children:i.map((function(e,n){return Object(b.jsxs)("div",{className:"week-day",children:[Object(b.jsx)("div",{className:"week-day-name",children:t.plus({days:n}).toFormat("cccc")},"day"),Object(b.jsx)("div",{className:"week-day-events",children:e.map((function(e,t){var n,a=960*((n=e.start_time).diff(n.startOf("day")).as("seconds")/86400),c=960*function(e,t){var n=t||u.DateTime.local();return e.endOf("day").equals(n.endOf("day"))?n.diff(e).as("seconds")/86400:e.endOf("day").diff(e).as("seconds")/86400}(e.start_time,e.end_time),i=function(e){return Math.max(Math.floor((e-10-10)/17),0)}(c);return Object(b.jsx)("div",{className:"week-event",style:{top:a,height:c},title:r[e.taskId].name+" - "+p((e.end_time||u.DateTime.local()).diff(e.start_time)),children:Object(b.jsx)("div",{className:"week-task-log-name",style:{WebkitLineClamp:i||"none"},children:i>0?r[e.taskId].name:""})},String(e.taskId)+String(t))}))})]},t.toString()+" "+n)}))})]})}n(36);function x(){var e=c.a.useState(u.DateTime.local().startOf("week")),t=Object(r.a)(e,2),n=t[0],a=t[1],i=c.a.useState("summary"),s=Object(r.a)(i,2),o=s[0],l=s[1];return Object(b.jsxs)("div",{children:[Object(b.jsxs)("div",{className:"week-select",children:[Object(b.jsx)("button",{className:"button minus",type:"button",onClick:function(){a(n.minus({weeks:1}))},children:"<"}),Object(b.jsx)("span",{className:"week-range",children:n.toFormat("d LLLL y")+" - "+n.endOf("week").toFormat("d LLLL y")}),Object(b.jsx)("button",{className:"button plus",type:"button",onClick:function(){a(n.plus({weeks:1}))},children:">"})," ",Object(b.jsx)("button",{className:"button plus",type:"button",onClick:function(){l("summary"===o?"timeline":"summary")},children:"\u21b7"})]}),Object(b.jsxs)("div",{children:["summary"===o&&Object(b.jsx)(g,{startOfWeek:n}),"timeline"===o&&Object(b.jsx)(y,{startOfWeek:n})]})]})}function N(){var e=c.a.useReducer((function(){return{}}),{}),t=Object(r.a)(e,2)[1];return c.a.useEffect((function(){var e=window.setInterval(t,6e4);return function(){return window.clearInterval(e)}}),[]),c.a.useEffect((function(){return window.addEventListener("focus",t),function(){return window.removeEventListener("focus",t)}}),[]),Object(b.jsxs)("div",{className:"App",children:[Object(b.jsx)(O,{}),Object(b.jsx)(x,{})]})}},22:function(e,t,n){"use strict";n.r(t),function(e){var t=n(0),r=n.n(t),a=n(6),c=n.n(a),i=n(21),s=n(20),u=n(5),o=n(12),l=(n(37),n(1));e.dbg=function(e){return console.log(e),e},c.a.render(Object(l.jsx)(r.a.StrictMode,{children:Object(l.jsx)(u.a,{children:Object(l.jsx)(o.a,{children:Object(l.jsx)(i.a,{})})})}),document.getElementById("root")),Object(s.a)()}.call(this,n(14))},29:function(e,t,n){},30:function(e,t,n){},36:function(e,t,n){},37:function(e,t,n){},5:function(e,t,n){"use strict";n.d(t,"c",(function(){return f})),n.d(t,"b",(function(){return v})),n.d(t,"a",(function(){return j})),n.d(t,"d",(function(){return h}));var r=n(4),a=n(2),c=n(8),i=n(3),s=n(0),u=n.n(s),o=n(1),l={tasks:[],events:[],activeTask:null,settings:{manDayDuration:i.Duration.fromObject({hours:7}),eventRetentionMonths:3},version:1},d=u.a.createContext({state:l,updateState:function(){}});function f(e){return JSON.stringify(e)}function v(e){var t=JSON.parse(e);if(1!==t.version)throw new Error('State in unsupported version "'.concat(t.version,'". Update the app.'));return Object(a.a)(Object(a.a)({},t),{},{events:t.events.map((function(e){return Object(a.a)(Object(a.a)({},e),{},{start_time:i.DateTime.fromISO(e.start_time),end_time:e.end_time&&i.DateTime.fromISO(e.end_time)})})),settings:Object(a.a)(Object(a.a)({},t.settings),{},{manDayDuration:i.Duration.fromISO(t.settings.manDayDuration)})})}function m(){var e=window.localStorage.getItem("state");return e?v(e):(b(l),l)}function b(e){window.localStorage.setItem("state",f(e))}function j(e){var t=e.children,n=u.a.useState(m),a=Object(r.a)(n,2),i=a[0],s=a[1],l=u.a.useRef(i),f=u.a.useRef(!1),v=u.a.useRef(null);u.a.useEffect((function(){return v.current=Object(c.debounce)((function(){f.current&&(b(l.current),f.current=!1)}),500,{trailing:!0,leading:!1}),function(){var e;return null===(e=v.current)||void 0===e?void 0:e.cancel()}}),[]),u.a.useEffect((function(){var e=function(){f.current&&(b(l.current),f.current=!1)},t=function(){f.current&&(b(l.current),f.current=!1)};return window.addEventListener("beforeunload",e),window.addEventListener("blur",t),function(){window.removeEventListener("beforeunload",e),window.removeEventListener("blur",t)}}),[]);return Object(o.jsx)(d.Provider,{value:{state:i,updateState:function(e){var t,n=e(i);l.current=n,f.current=!0,s(n),null===(t=v.current)||void 0===t||t.call(v)}},children:t})}function h(){return u.a.useContext(d)}}},[[22,1,2]]]);
//# sourceMappingURL=main.437b1a02.chunk.js.map