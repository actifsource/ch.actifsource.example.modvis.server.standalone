package ch.actifsource.example.modvis.server.standalone.implementation.server;

import ch.actifsource.solution.modvis.server.core.IAnimationEnvironment;
import ch.actifsource.solution.modvis.server.core.handler.Logger.LogType;
import ch.actifsource.solution.modvis.server.core.web.IAnimationWebServer;
import ch.actifsource.util.Assert;

/**
 * Defines the animation web server.
 * @author ruti
 *
 */
public class AnimationWebServer implements IAnimationWebServer {

	private final IAnimationEnvironment          	   fAnimationEnvironment;
	
	private AnimationWebSocket                       fWebSocketConnection;
	
	/**
	 * Constructor AnimationWebServer
	 */
	public AnimationWebServer(IAnimationEnvironment animationEnvironment) {
		fAnimationEnvironment = animationEnvironment;
	}

	private AnimationWebSocket createWebSocketConnection() {
	  fAnimationEnvironment.getLogger().logMessage(LogType.SERVER,"BROWSER: Connected");
    return new AnimationWebSocket(fAnimationEnvironment);
	}
	
	public AnimationWebSocket getWebSocketConnection() {
	  return fWebSocketConnection;
	}
	
	/**
	 * Returns true if the web server is started.
	 */
	@Override
	public boolean isWebServerStarted() {
		return true;
	}

	/**
	 * Start the web server.
	 */
	@Override
	public void startWebServer() throws Exception {
	  fAnimationEnvironment.getLogger().logMessage(LogType.SERVER,"WEBSERVER: is Started");	  
	  
		// Create a new websocket connection if the Open new websocket connection 
	  fWebSocketConnection = createWebSocketConnection();
	}

	/**
	 * Stop the web server.
	 */
	@Override
	public void stopWebServer() throws Exception {
		fAnimationEnvironment.getLogger().logMessage(LogType.SERVER,"WEBSERVER: is Stoped");
	}

	@Override
	public void addLifeCycleListener(IServerStatusListener listener) {
		
	}

	@Override
	public void removeLifeCycleListener(IServerStatusListener listener) {
		
	}

	@Override
	public void dispose() {
	  try {
      stopWebServer();
    } catch (Exception e) {
      Assert.logError(e);
    }
	}

}
