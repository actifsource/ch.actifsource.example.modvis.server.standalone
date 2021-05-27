package ch.actifsource.example.modvis.server.standalone.implementation;

import java.util.List;
import ch.actifsource.example.modvis.server.standalone.implementation.error.ErrorHandler;
import ch.actifsource.example.modvis.server.standalone.implementation.server.AnimationWebServer;
import ch.actifsource.example.modvis.server.standalone.implementation.server.AnimationWebSocket;
import ch.actifsource.example.modvis.server.standalone.implementation.target.AnimationTarget;
import ch.actifsource.solution.modvis.server.core.BaseSimpleServiceBuilder;
import ch.actifsource.solution.modvis.server.core.IAnimationEnvironment;
import ch.actifsource.solution.modvis.server.core.IServiceBuilder;
import ch.actifsource.solution.modvis.server.core.file.BaseFileLocator;
import ch.actifsource.solution.modvis.server.core.file.IFileLocator;
import ch.actifsource.solution.modvis.server.core.handler.IErrorHandler;
import ch.actifsource.solution.modvis.server.core.tcp.ITargetConnection;
import ch.actifsource.solution.modvis.server.core.web.IAnimationWebServer;

/**
 * Defines the animation stand alone application environment. 
 */
public class AnimationApplication {

  /**
   * Define the root folder location.
   */
  public final String fRootFolder;
  
  public AnimationApplication(String rootFolder) {
    fRootFolder = rootFolder;
  }
  
  /**
   * Defines the file locator for the animation stand alone application environment. 
   */
  public static class ApplicationFileLocator extends BaseFileLocator {
    
    private final String      fRootFolder;
    
    /**
     * Constructor ApplicationFileLocator
     * The root folder contains the www and config folder.
     */
    public ApplicationFileLocator(String rootFolder) {
      fRootFolder = rootFolder;
    }
 
    /**
     * @return the web folder path as string.
     * The web folder contains the html, json, and svg files.
     */
    @Override
    public String getWebFolderPathDirectory() {
      return fRootFolder+"/"+IFileLocator.WEB_FOLDER;
    }
    
    /**
     * @return the config folder path as string.
     * The config folder contains the config json files.
     */
    @Override
    public String getConfigFolderPathDirectory() {
      return fRootFolder+"/"+IFileLocator.CONFIG_FOLDER;
    }
  }
  
  /**
   * Define the test service builder
   */
  public static class TestSimpleServiceBuilder extends BaseSimpleServiceBuilder {
	  
	  public static IServiceBuilder DUMMY = new TestSimpleServiceBuilder();
	  
	  @Override
	  public IAnimationWebServer createAnimationWebServer(IAnimationEnvironment animationEnvironment) {
	    return new AnimationWebServer(animationEnvironment);
	  }

	  @Override
	  public ITargetConnection createTargetConnection(IAnimationEnvironment animationEnvironment) {
	    return new AnimationTarget(animationEnvironment);
	  }
	  
	  @Override
	  public IErrorHandler createErrorHandler(IAnimationEnvironment animationEnvironment) {
	    return new ErrorHandler(animationEnvironment);
	  }  
  }
  
  /**
   * Start the stand alone application
   */
	public void start() {
	  IAnimationEnvironment animationEnvironment = new ch.actifsource.solution.modvis.server.core.AnimationEnvironment(new ApplicationFileLocator(fRootFolder), TestSimpleServiceBuilder.DUMMY);
		IErrorHandler errorHandler = animationEnvironment.getErrorHandler();
		try{
		  
		  // Start web server and connect target
		  animationEnvironment.getOrCreateAnimationWebServer().startWebServer();
		  animationEnvironment.getOrCreateTargetConnection().openConnection();
		  AnimationTarget animationTarget = ((AnimationTarget)animationEnvironment.getOrCreateTargetConnection());
		  AnimationWebSocket animationWebSocket = ((AnimationWebServer)animationEnvironment.getOrCreateAnimationWebServer()).getWebSocketConnection();
		  showMessage("MessagesToTarget", sendMessagesToTarget(animationTarget));
		  showMessage("MessagesToBrowser", sendMessagesToBrowser(animationWebSocket));
		  
	    String jsonMessage = "{\"bind\":[{\"id\":[]}]}";
	    receiveMessageFromBrowser(animationWebSocket, jsonMessage);
	    showMessage("MessagesToTarget", sendMessagesToTarget(animationTarget));
	    
	    jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"history\"}}";
	    receiveMessageFromTarget(animationTarget, jsonMessage);
	    jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"snapshot\"}}";
	    receiveMessageFromTarget(animationTarget, jsonMessage);
	    jsonMessage = "{\"elmStartType\":{\"id\":[],\"type\":\"update\"}}";
      receiveMessageFromTarget(animationTarget, jsonMessage);
	    jsonMessage = "{\"elm\":[{\"id\":[2, 1, 1],\"st\":1,\"seq\":0}]}";
	    receiveMessageFromTarget(animationTarget, jsonMessage);

	    showMessage("MessagesToTarget", sendMessagesToTarget(animationTarget));
	    showMessage("MessagesToBrowser", sendMessagesToBrowser(animationWebSocket));
	    
	    jsonMessage = "{\"crc\":\"get\", \"modulId\":[]}";
	    receiveMessageFromBrowser(animationWebSocket, jsonMessage);
	    showMessage("MessagesToTarget", sendMessagesToTarget(animationTarget));
	    
	    jsonMessage = "{\"crc\":498202763,\"modulId\":[]}";
	    receiveMessageFromTarget(animationTarget, jsonMessage);
	    showMessage("MessagesToBrowser", sendMessagesToBrowser(animationWebSocket));
	    
	    System.out.println("*********");
	    showMessage("log", animationEnvironment.getLogger().getLog());
	    animationEnvironment.getLogger().clearLoc();
	    
		} catch (Throwable e) {
		  e.printStackTrace();
			errorHandler.handleException(e);
		} finally {
		  animationEnvironment.dispose();
		}
	}
	
	/**********
	 * Util
	 *********/

  /**
   * Handle message from browser.
   */
  public void receiveMessageFromBrowser(AnimationWebSocket animationWebSocket, String jsonMessage) {
    animationWebSocket.handleMessage(jsonMessage);
  }
  
  /**
   * Returns all send messages to the browser
   */
  public List<String> sendMessagesToBrowser(AnimationWebSocket animationWebSocket) {
    return animationWebSocket.getSendMessagesAndClear();
  }
  
  /**
   * Handle message from Target
   */
  public void receiveMessageFromTarget(AnimationTarget animationTarget, String jsonMessage) {
    animationTarget.handleMessage(jsonMessage);
  }
  
  /**
   * Returns all send messages to the target
   */
  public List<String> sendMessagesToTarget(AnimationTarget animationTarget) {
    return animationTarget.getSendMessagesAndClear();
  }
  
  /**
   * Print the log to the console
   */
  private void showMessage(String title, List<String> messages) {
    System.out.println(title+":");
    for (String message :messages) {
      System.out.println("   "+message);
    }
  }
}
