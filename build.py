import re
js=open('src/app.js').read().replace("</script","<\\/script")
h=open('index.html').read()
h=re.sub(r'<script>.*</script>', lambda m: '<script>'+js+'</script>', h, flags=re.S)
open('index.html','w').write(h)
