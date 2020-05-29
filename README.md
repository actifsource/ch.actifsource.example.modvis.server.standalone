# Modvis Standalone Server
In this project we will show how to use the modvis server core project independent from actifsource.  
Use your own server and target implementation.  
![Core](images/modviscore.png)

To test the example, start the animation server application (AnimationServer.java).

```
String jsonMessage = "{\"bind\":[{\"id\":[]}]}";
receiveMessageFromBrowser(animationWebSocket, jsonMessage);
    
jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"history\"}}";
receiveMessageFromTarget(animationTarget, jsonMessage);
jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"snapshot\"}}";
receiveMessageFromTarget(animationTarget, jsonMessage);
jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"update\"}}";
receiveMessageFromTarget(animationTarget, jsonMessage);
jsonMessage = "{\"elm\":[{\"id\":[2, 1, 1],\"st\":1,\"seq\":0}]}";
receiveMessageFromTarget(animationTarget, jsonMessage);

jsonMessage = "{\"crc\":\"get\", \"modulId\":[]}";
receiveMessageFromBrowser(animationWebSocket, jsonMessage);  
jsonMessage = "{\"crc\":498202763,\"modulId\":[]}";
receiveMessageFromTarget(animationTarget, jsonMessage);
```
Console:

```
Start application
WEBSOCKET: is onOpen
TARGET Connection Open IP: 127.0.0.1 Port: 11111
TO BROWSER: {"serverState":{"startServer":true,"connectTarget":true}}
MessagesToTarget:
MessagesToBrowser:
   {"serverState":{"startServer":true,"connectTarget":true}}
FROM BROWSER: {"bind":[{"id":[]}]}
INTERNAL: Bind Modul: []
TO TARGET: {"bind":[{"id":[]}]}
INTERNAL: Modul [] is Online
MessagesToTarget:
   {"bind":[{"id":[]}]}
INTERNAL: Init update history started: []
INTERNAL: Init update snapshot started: []
INTERNAL: Init update started: []
TO BROWSER: {"partsize":1,"elm":[{"st":0,"id":[2,1,4],"modulId":[],"seq":0}],"part":1,"reset":true}
TO BROWSER: {"partsize":1,"elm":[{"st":1,"id":[2,1,1],"time":1590744874946,"modulId":[],"seq":0}],"part":1,"reset":false}
MessagesToTarget:
MessagesToBrowser:
   {"partsize":1,"elm":[{"st":0,"id":[2,1,4],"modulId":[],"seq":0}],"part":1,"reset":true}
   {"partsize":1,"elm":[{"st":1,"id":[2,1,1],"time":1590744874946,"modulId":[],"seq":0}],"part":1,"reset":false}
FROM BROWSER: {"crc":"get", "modulId":[]}
TO TARGET: {"crc":"get","modulId":[]}
MessagesToTarget:
   {"crc":"get","modulId":[]}
TO BROWSER: {"crc":498202763,"modulId":[]}
MessagesToBrowser:
   {"crc":498202763,"modulId":[]}
*********
log:
   WEBSERVER: is Started
   BROWSER: Connected
   WEBSOCKET: is onOpen
   TARGET Connection Open IP: 127.0.0.1 Port: 11111
   TO BROWSER: {"serverState":{"startServer":true,"connectTarget":true}}
   FROM BROWSER: {"bind":[{"id":[]}]}
   INTERNAL: Bind Modul: []
   TO TARGET: {"bind":[{"id":[]}]}
   INTERNAL: Modul [] is Online
   INTERNAL: Init update history started: []
   INTERNAL: Init update snapshot started: []
   INTERNAL: Init update started: []
   TO BROWSER: {"partsize":1,"elm":[{"st":0,"id":[2,1,4],"modulId":[],"seq":0}],"part":1,"reset":true}
   TO BROWSER: {"partsize":1,"elm":[{"st":1,"id":[2,1,1],"time":1590744874946,"modulId":[],"seq":0}],"part":1,"reset":false}
   FROM BROWSER: {"crc":"get", "modulId":[]}
   TO TARGET: {"crc":"get","modulId":[]}
   TO BROWSER: {"crc":498202763,"modulId":[]}
TARGET Connection closed
End application
```

## Requirements
Actifsource  Workbench Enterprise Edition

## License
[http://www.actifsource.com/company/license](http://www.actifsource.com/company/license)
