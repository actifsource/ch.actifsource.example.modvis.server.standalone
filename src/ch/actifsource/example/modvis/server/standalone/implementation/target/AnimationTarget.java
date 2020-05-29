package ch.actifsource.example.modvis.server.standalone.implementation.target;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import ch.actifsource.solution.modvis.server.core.IAnimationEnvironment;
import ch.actifsource.solution.modvis.server.core.config.AnimationConfig.TargetConnectionConfig;
import ch.actifsource.solution.modvis.server.core.handler.Logger.LogType;
import ch.actifsource.solution.modvis.server.core.tcp.ITargetConnection;
import ch.actifsource.solution.modvis.server.core.util.IJsonMessageListener;
import ch.actifsource.solution.modvis.server.core.util.JsonUtil;
import ch.actifsource.solution.modvis.server.core.util.JsonUtil.JsonObject;

/**
 * Defines a target connection. 
 * @author ruti
 *
 */
public class AnimationTarget implements ITargetConnection {

	private final List<IJsonMessageListener> fMessageListeners = Collections.synchronizedList(new ArrayList<IJsonMessageListener>());
	
	private final List<ISocketListener> 		 fSocketListener = Collections.synchronizedList(new ArrayList<ISocketListener>());

	private final List<String>               fSendMessages = new ArrayList<String>();
	
	private final IAnimationEnvironment      fAnimationEnvironment;
	
	public AnimationTarget(IAnimationEnvironment animationEnvironment) {
	  fAnimationEnvironment = animationEnvironment;
	}

	/**
	 * Target is connected.
	 */
	@Override
	public boolean isConnected() {
		return true;
	}

	/**
	 * Close the target connection
	 */
	@Override
	public void closeConnection() {
		fAnimationEnvironment.getLogger().logMessage(LogType.TARGET,"TARGET Connection closed");
		
		for (ISocketListener listener : fSocketListener) {
      listener.connectionClosed();
    }
	}

	/**
	 * Open target connection.
	 */
	@Override
	public void openConnection() {
	  TargetConnectionConfig config = fAnimationEnvironment.getAnimationConfig().getTargetConnectionConfig();
	  fAnimationEnvironment.getLogger().logMessage(LogType.TARGET,"TARGET Connection Open IP: " + config.getIP() + " Port: "+ config.getPort());
    // Start read message stream
	  
	  for (ISocketListener listener : fSocketListener) {
      listener.connectionOpen();  
    }
	}

	@Override
	public void addMessageListener(IJsonMessageListener messageListener) {
		fMessageListeners.add(messageListener);
	}

	@Override
	public void removeMessageListener(IJsonMessageListener messageListener) {
		fMessageListeners.remove(messageListener);
	}

	@Override
	public void addSocketListener(ISocketListener listener) {
		fSocketListener.add(listener);
	}
	
	@Override
	public void removeSocketListener(ISocketListener listener) {
		fSocketListener.remove(listener);
	}
	
	/**
	 * Send json message to the target.
	 */
	@Override
	public void sendMessage(JsonObject jsonMessage) {
		String message = JsonUtil.jsonToStringOrdered(jsonMessage);
		// Write message to the target
		fAnimationEnvironment.getLogger().logMessage(LogType.TARGET,"TO TARGET: "+message);
		
		fSendMessages.add(message);
	}
	
	@Override
  public void dispose() {
    closeConnection();
  }
	
	/**
	 * Handle json message from target
	 */
	public void handleMessage(String jsonString) {
	  JsonObject jsonMessage = JsonUtil.parseToJsonObject(jsonString);
	  
	  // Sync call to application thread!!!
    for (IJsonMessageListener messageListener : fMessageListeners) {
      messageListener.handleMessage(jsonMessage);  
    }
	}
	
	/**
	 * Returns all send messages to the target.
	 */
	public List<String> getSendMessagesAndClear() {
    List<String> copy = new ArrayList<>(fSendMessages);
    fSendMessages.clear();
    return copy;
  }
	
	
}
