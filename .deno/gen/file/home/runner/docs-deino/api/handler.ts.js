import './link-resolver.js';
import './text-rewriter.js';
import './dino.css.js';
import './dino.js';
import './host-bridge.js';
let hostTarget = "docs.deno.com";
let docsTarget = "docs.deno.com";
const skipRequestHeaders = [
    'x-forwarded-for'
];
const skipResponseHeaders = [
    "connection",
    "content-length",
    'x-frame-options',
    'x-content-type-options'
];
let injects = globalThis['link-resolver-import'] + globalThis['text-rewriter'] + globalThis.dinoCSS + globalThis.dino + globalThis['host-bridge'];
export default async function(req) {
    if (req.method == "OPTIONS" || req.url == '*') {
        return new Response("", {
            headers: {
                Allow: "OPTIONS, GET, HEAD, POST"
            }
        });
    }
    let reqURL = req.url.replace('_root/', '').replace('_root', '');
    let url = reqURL.split('/');
    let flatURL = reqURL.split('?')[0].split('#')[0];
    let localhost = url[2];
    url[2] = hostTarget;
    if (reqURL.includes('hostname=')) {
        url[2] = reqURL.split('hostname=')[1].split('&')[0].split('#')[0];
    }
    if (reqURL.includes('/manual')) {
        url[2] = docsTarget;
    }
    let request = new Request(url.join("/"));
    for(let header in request.headers.keys){
        if (header) {
            if (skipRequestHeaders.includes(header.toLowerCase())) {
                continue;
            }
            request.headers.set(header, request.headers.get(header).toString().replace(localhost, hostTarget));
        }
    }
    //request = addCacheHeaders(request);
    let res = await fetch(request);
    let body = "";
    let htmlFlag = false;
    if (!res.headers.has('Content-Type') || !res.headers.get('content-type')) {
        body = await res.arrayBuffer();
        const typedArray = new Uint8Array(body);
        let array = [
            ...typedArray
        ];
        array.length = 50;
        //console.log(String.fromCharCode(...array));
        htmlFlag = true;
    } else {
        let ct = res.headers.get('content-type').toLowerCase();
        //console.log(ct);
        if (ct.includes('text')) {
            let headText = injects;
            body = (await res.text()).replace('<head>', '<head>' + headText).replace('</head>', headText + '</head>');
            if (body.includes('<html') || ct.includes('plain')) {
                htmlFlag = true;
            }
        } else if (flatURL.endsWith('.js')) {
            body = (await res.text()).replaceAll(hostTarget, localhost);
        } else if (res.body) {
            body = await res.arrayBuffer();
            const typedArray = new Uint8Array(body);
            let array = [
                ...typedArray
            ];
            array.length = 50;
        //console.log(String.fromCharCode(...array));
        }
    }
    let response = new Response(body);
    for(let header in response.headers.keys){
        if (header) {
            if (skipResponseHeaders.includes(header.toLowerCase())) {
                continue;
            }
            request.headers.set(header, response.headers.get(header).toString().replace(hostTarget, localhost));
        }
    }
    if (htmlFlag) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (!response.headers.get('Content-Type')) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (response.headers.get('Content-Type').toLowerCase().includes('plain')) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (flatURL.endsWith('.js')) {
        response.headers.set('Content-Type', 'text/javascript');
    }
    if (flatURL.endsWith('.css')) {
        response.headers.set('Content-Type', 'text/css');
    }
    if (flatURL.endsWith('.svg')) {
        response.headers.set('Content-Type', 'image/svg+xml');
    }
    if (flatURL.endsWith('.png')) {
        response.headers.set('Content-Type', 'image/png');
    }
    if (flatURL.endsWith('.jpg') || flatURL.endsWith('.jpeg')) {
        response.headers.set('Content-Type', 'image/jpeg');
    }
    //console.log(response.headers.get('content-type'));
    //response = addCacheHeaders(response);
    return response;
}
function addCacheHeaders(re) {
    re.headers.set("CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Surrogate-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Vercel-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    return re;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvZG9jcy1kZWluby9hcGkvaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbGluay1yZXNvbHZlci5qcyc7XG5pbXBvcnQgJy4vdGV4dC1yZXdyaXRlci5qcyc7XG5pbXBvcnQgJy4vZGluby5jc3MuanMnO1xuaW1wb3J0ICcuL2Rpbm8uanMnO1xuaW1wb3J0ICcuL2hvc3QtYnJpZGdlLmpzJztcbmxldCBob3N0VGFyZ2V0ID0gXCJkb2NzLmRlbm8uY29tXCI7XG5sZXQgZG9jc1RhcmdldCA9IFwiZG9jcy5kZW5vLmNvbVwiO1xuXG5jb25zdCBza2lwUmVxdWVzdEhlYWRlcnM6IHN0cmluZ1tdID0gWyd4LWZvcndhcmRlZC1mb3InXTtcbmNvbnN0IHNraXBSZXNwb25zZUhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbm5lY3Rpb25cIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGVudC1sZW5ndGhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gtZnJhbWUtb3B0aW9ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4LWNvbnRlbnQtdHlwZS1vcHRpb25zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG5cbmxldCBpbmplY3RzID0gZ2xvYmFsVGhpc1snbGluay1yZXNvbHZlci1pbXBvcnQnXStcbiAgZ2xvYmFsVGhpc1sndGV4dC1yZXdyaXRlciddK1xuICBnbG9iYWxUaGlzLmRpbm9DU1MrIFxuICBnbG9iYWxUaGlzLmRpbm8rXG4gIGdsb2JhbFRoaXNbJ2hvc3QtYnJpZGdlJ107XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChyZXE6IFJlcXVlc3QpIHtcblxuICBpZiAoKHJlcS5tZXRob2QgPT0gXCJPUFRJT05TXCIpfHwocmVxLnVybD09JyonKSkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJcIix7aGVhZGVyczp7QWxsb3c6IFwiT1BUSU9OUywgR0VULCBIRUFELCBQT1NUXCJ9fSk7XG4gIH1cbiBcbiAgbGV0IHJlcVVSTCA9IHJlcS51cmwucmVwbGFjZSgnX3Jvb3QvJywnJykucmVwbGFjZSgnX3Jvb3QnLCcnKTtcbiAgbGV0IHVybD1yZXFVUkwuc3BsaXQoJy8nKTtcbiAgbGV0IGZsYXRVUkwgPSByZXFVUkwuc3BsaXQoJz8nKVswXS5zcGxpdCgnIycpWzBdO1xuICBsZXQgbG9jYWxob3N0ID0gdXJsWzJdO1xuICB1cmxbMl0gPSBob3N0VGFyZ2V0O1xuICBpZihyZXFVUkwuaW5jbHVkZXMoJ2hvc3RuYW1lPScpKXtcbiAgICB1cmxbMl09cmVxVVJMLnNwbGl0KCdob3N0bmFtZT0nKVsxXS5zcGxpdCgnJicpWzBdLnNwbGl0KCcjJylbMF07XG4gIH1cbiAgaWYocmVxVVJMLmluY2x1ZGVzKCcvbWFudWFsJykpe1xuICAgIHVybFsyXT1kb2NzVGFyZ2V0O1xuICB9XG4gIGxldCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLmpvaW4oXCIvXCIpKTtcbiAgXG4gIGZvciAobGV0IGhlYWRlciBpbiByZXF1ZXN0LmhlYWRlcnMua2V5cykge1xuICAgIGlmIChoZWFkZXIpIHtcbiAgICAgIGlmIChza2lwUmVxdWVzdEhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldChcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuZ2V0KGhlYWRlcikudG9TdHJpbmcoKS5yZXBsYWNlKGxvY2FsaG9zdCwgaG9zdFRhcmdldCksXG4gICAgICApO1xuICAgIH1cbiAgfVxuICAvL3JlcXVlc3QgPSBhZGRDYWNoZUhlYWRlcnMocmVxdWVzdCk7XG4gIGxldCByZXMgPSBhd2FpdCBmZXRjaChyZXF1ZXN0KTtcblxuICBsZXQgYm9keSA9IFwiXCI7XG4gIGxldCBodG1sRmxhZyA9IGZhbHNlO1xuICBpZigoIXJlcy5oZWFkZXJzLmhhcygnQ29udGVudC1UeXBlJykpfHwoIXJlcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpKXtcbiAgICBib2R5ID0gYXdhaXQgcmVzLmFycmF5QnVmZmVyKCk7XG4gICAgY29uc3QgdHlwZWRBcnJheSA9IG5ldyBVaW50OEFycmF5KGJvZHkpO1xuICAgIGxldCBhcnJheSA9IFsuLi50eXBlZEFycmF5XTtcbiAgICBhcnJheS5sZW5ndGg9NTA7XG4gICAgLy9jb25zb2xlLmxvZyhTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmFycmF5KSk7XG4gICAgaHRtbEZsYWc9dHJ1ZTtcbiAgfSBcbiBlbHNle1xuICAgbGV0IGN0PXJlcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykudG9Mb3dlckNhc2UoKTtcbiAgIC8vY29uc29sZS5sb2coY3QpO1xuICAgaWYoY3QuaW5jbHVkZXMoJ3RleHQnKSl7XG4gICAgICBsZXQgaGVhZFRleHQ9aW5qZWN0cztcbiAgICAgIGJvZHk9KGF3YWl0IHJlcy50ZXh0KCkpXG4gICAgICAgIC5yZXBsYWNlKCc8aGVhZD4nLCc8aGVhZD4nK2hlYWRUZXh0KVxuICAgICAgICAucmVwbGFjZSgnPC9oZWFkPicsaGVhZFRleHQrJzwvaGVhZD4nKTtcbiAgICAgIGlmKGJvZHkuaW5jbHVkZXMoJzxodG1sJyl8fGN0LmluY2x1ZGVzKCdwbGFpbicpKXtodG1sRmxhZz10cnVlO31cbiAgICB9XG4gZWxzZSBpZihmbGF0VVJMLmVuZHNXaXRoKCcuanMnKSl7XG4gICAgYm9keT0oYXdhaXQgcmVzLnRleHQoKSkucmVwbGFjZUFsbChob3N0VGFyZ2V0LGxvY2FsaG9zdCk7XG4gIH1cbiAgZWxzZSBpZiAocmVzLmJvZHkpIHtcbiAgICBib2R5ID0gYXdhaXQgcmVzLmFycmF5QnVmZmVyKCk7XG4gICAgY29uc3QgdHlwZWRBcnJheSA9IG5ldyBVaW50OEFycmF5KGJvZHkpO1xuICAgIGxldCBhcnJheSA9IFsuLi50eXBlZEFycmF5XTtcbiAgICBhcnJheS5sZW5ndGg9NTA7XG4gICAgLy9jb25zb2xlLmxvZyhTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmFycmF5KSk7XG4gIH1cbn1cbiAgbGV0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHkpO1xuICBmb3IgKGxldCBoZWFkZXIgaW4gcmVzcG9uc2UuaGVhZGVycy5rZXlzKSB7XG4gICAgaWYgKGhlYWRlcikge1xuICAgICAgaWYgKHNraXBSZXNwb25zZUhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldChcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICByZXNwb25zZS5oZWFkZXJzLmdldChoZWFkZXIpLnRvU3RyaW5nKCkucmVwbGFjZShob3N0VGFyZ2V0LCBsb2NhbGhvc3QpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBpZihodG1sRmxhZyl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvaHRtbCcpO1xuICB9XG4gIGlmKCFyZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCd0ZXh0L2h0bWwnKTtcbiAgfVxuICBpZihyZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncGxhaW4nKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvaHRtbCcpO1xuICB9XG4gIGlmKGZsYXRVUkwuZW5kc1dpdGgoJy5qcycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywndGV4dC9qYXZhc2NyaXB0Jyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLmNzcycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywndGV4dC9jc3MnKTtcbiAgfVxuICBpZihmbGF0VVJMLmVuZHNXaXRoKCcuc3ZnJykpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCdpbWFnZS9zdmcreG1sJyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLnBuZycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywnaW1hZ2UvcG5nJyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLmpwZycpfHxmbGF0VVJMLmVuZHNXaXRoKCcuanBlZycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywnaW1hZ2UvanBlZycpO1xuICB9XG4gIC8vY29uc29sZS5sb2cocmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgLy9yZXNwb25zZSA9IGFkZENhY2hlSGVhZGVycyhyZXNwb25zZSk7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuXG5mdW5jdGlvbiBhZGRDYWNoZUhlYWRlcnMocmUpe1xuICByZS5oZWFkZXJzLnNldChcIkNETi1DYWNoZS1Db250cm9sXCIsXG4gICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuICk7XG4gIHJlLmhlYWRlcnMuc2V0KFwiQ2FjaGUtQ29udHJvbFwiLFxuICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuKTtcbiAgcmUuaGVhZGVycy5zZXQoIFwiQ2xvdWRmbGFyZS1DRE4tQ2FjaGUtQ29udHJvbFwiLFxuICAgIFwicHVibGljLCBtYXgtYWdlPTk2NDAwLCBzLW1heC1hZ2U9OTY0MDAsIHN0YWxlLWlmLWVycm9yPTMxNTM1MDAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlPTMxNTM1MDAwXCJcbik7XG4gIHJlLmhlYWRlcnMuc2V0KFwiU3Vycm9nYXRlLUNvbnRyb2xcIixcbiAgIFwicHVibGljLCBtYXgtYWdlPTk2NDAwLCBzLW1heC1hZ2U9OTY0MDAsIHN0YWxlLWlmLWVycm9yPTMxNTM1MDAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlPTMxNTM1MDAwXCJcbik7XG4gIHJlLmhlYWRlcnMuc2V0KFwiVmVyY2VsLUNETi1DYWNoZS1Db250cm9sXCIsXG4gICBcInB1YmxpYywgbWF4LWFnZT05NjQwMCwgcy1tYXgtYWdlPTk2NDAwLCBzdGFsZS1pZi1lcnJvcj0zMTUzNTAwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMTUzNTAwMFwiXG4pO1xuICByZXR1cm4gcmU7XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8scUJBQXFCO0FBQzVCLE9BQU8scUJBQXFCO0FBQzVCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sWUFBWTtBQUNuQixPQUFPLG1CQUFtQjtBQUMxQixJQUFJLGFBQWE7QUFDakIsSUFBSSxhQUFhO0FBRWpCLE1BQU0scUJBQStCO0lBQUM7Q0FBa0I7QUFDeEQsTUFBTSxzQkFBc0I7SUFDRTtJQUNEO0lBQ0E7SUFDQTtDQUNBO0FBRTdCLElBQUksVUFBVSxVQUFVLENBQUMsdUJBQXVCLEdBQzlDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FDM0IsV0FBVyxVQUNYLFdBQVcsT0FDWCxVQUFVLENBQUMsY0FBYztBQUUzQixlQUFlLGVBQWdCLEdBQVk7SUFFekMsSUFBSSxBQUFDLElBQUksVUFBVSxhQUFhLElBQUksT0FBSyxLQUFNO1FBQzdDLE9BQU8sSUFBSSxTQUFTLElBQUc7WUFBQyxTQUFRO2dCQUFDLE9BQU87WUFBMEI7UUFBQztJQUNyRTtJQUVBLElBQUksU0FBUyxJQUFJLElBQUksUUFBUSxVQUFTLElBQUks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