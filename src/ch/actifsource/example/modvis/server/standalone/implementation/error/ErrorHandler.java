package ch.actifsource.example.modvis.server.standalone.implementation.error;

import ch.actifsource.solution.modvis.server.core.IAnimationEnvironment;
import ch.actifsource.solution.modvis.server.core.dialog.IDialogContent;
import ch.actifsource.solution.modvis.server.core.handler.BaseErrorHandler;
import ch.actifsource.solution.modvis.server.core.handler.Logger.LogType;

/**
 * Defines the animation error handler.
 * @author ruti
 *
 */
public class ErrorHandler extends BaseErrorHandler {
  
	/**
   * Constructor ErrorHandler
   */
  public ErrorHandler(IAnimationEnvironment animationEnvironment) {
    super(animationEnvironment);
  }
  
	/*****************
   * Handle error
   *****************/
	
	/**
	 * Handle a throwable exception.
	 * @param e
	 */
	@Override
	public void handleException(Throwable t) {
	  fAnimationEnvironment.getLogger().logMessage(LogType.INTERNAL, "Exception");
	}
	
	/**
   * Handle a error message.
   * @param errorMessage
   */
	@Override
  protected void handleError(final String errorBrowserMessage, String errorServerMessage, ErrorType errorType) {
    fAnimationEnvironment.getLogger().logMessage(LogType.INTERNAL, "ERROR:"+ errorServerMessage +" ErrorType: " + errorType);
  }
 
	/*****************
   * Open dialog
   *****************/
	
	 /**
   * Open a exception dialog.
   */
	@Override
  public boolean openExceptionDialog(Throwable t, final IDialogContent message) {
    return true;
  }
  
   /**
   * Open a message dialog.
   */
	@Override
  public boolean openMessageDialog(final IDialogContent message, final MessageType messageType) {
    return true;
  }
  
	/**
	 * dispose
	 */
	@Override
	public void dispose() {
		
	}
}
