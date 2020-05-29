package ch.actifsource.example.modvis.server.standalone.implementation.server;

import java.util.ArrayList;
import java.util.List;
import ch.actifsource.solution.modvis.server.core.IAnimationEnvironment;
import ch.actifsource.solution.modvis.server.core.handler.Logger.LogType;
import ch.actifsource.solution.modvis.server.core.service.context.WebsocketUpdateContext;
import ch.actifsource.solution.modvis.server.core.util.JsonUtil;
import ch.actifsource.solution.modvis.server.core.util.JsonUtil.JsonObject;
import ch.actifsource.solution.modvis.server.core.web.IServerConnection;
import ch.actifsource.util.Assert;

/**
 * Defines the Animation WebSocket connection.
 * A web server has multi web socket connections.
 * @author ruti
 *
 */
public class AnimationWebSocket implements IServerConnection {
  
  private final IAnimationEnvironment  fAnimationEnvironment;
  
  private final WebsocketUpdateContext fContext;
  
  private final List<String>           fSendMessages = new ArrayList<String>();
  
  /**
   * Constructor AnimationWebSocket
   */
  public AnimationWebSocket(IAnimationEnvironment animationEnvironment) {
    fAnimationEnvironment = animationEnvironment;
    fContext = new WebsocketUpdateContext(this);
    
    onOpen();
  }
  
  @Override
  public boolean connectionIsOpen() {
    return true;
  }
  
  /**
   * Open the web socket connection.
   */
  public void onOpen() {
    fAnimationEnvironment.getLogger().logMessage(LogType.TARGET, "WEBSOCKET: is onOpen");
    
    // Sync call to application thread!!!
    fAnimationEnvironment.getOrCreateUpdateService().addServerConnection(fContext);
  }
  
  /**
    * Close the web socket connection.
    */
  public void onClose(int closeCode, String message) {
    fAnimationEnvironment.getLogger().logMessage(LogType.TARGET, "WEBSOCKET: is onClose");
    
    // Sync call to application thread!!!
    fAnimationEnvironment.getOrCreateUpdateService().removeServerConnection(fContext);
  }
  
  /**
   * Send any message to the web socket.
   */
  @Override
  public void sendMessage(JsonObject jsonMessage) {
    try {
      Assert.assertTrue("Target connection not open!", connectionIsOpen());
      String message = JsonUtil.jsonToString(jsonMessage);
      fAnimationEnvironment.getLogger().logMessage(LogType.TARGET, "TO BROWSER: " + message);
      
      fSendMessages.add(message);
      
      // Send the json message to the browser
    } catch (Throwable e) {
      fAnimationEnvironment.getErrorHandler().handleException(e);
    }
  }
  
  /**
   * Handle incoming message.
   * Incoming message are send to the update service. 
   */
  public void handleMessage(String data) {
    fAnimationEnvironment.getLogger().logMessage(LogType.TARGET, "FROM BROWSER: " + data);
    try {
      final JsonObject jsonMessage = JsonUtil.parseToJsonObject(data);
      
      // Sync call to application thread!!!
      fAnimationEnvironment.getOrCreateUpdateService().handleMessageRequest(fContext, jsonMessage);
      
    } catch (Throwable e) {
      fAnimationEnvironment.getErrorHandler().handleException(e);
    }
  }
  
  /**
   * Returns all send messages to the browser.
   */
  public List<String> getSendMessagesAndClear() {
    List<String> copy = new ArrayList<>(fSendMessages);
    fSendMessages.clear();
    return copy;
  }
}
