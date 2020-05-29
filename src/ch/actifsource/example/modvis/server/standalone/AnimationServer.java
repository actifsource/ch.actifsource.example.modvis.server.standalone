package ch.actifsource.example.modvis.server.standalone;

import ch.actifsource.example.modvis.server.standalone.implementation.AnimationApplication;

public class AnimationServer {

  public static final String ROOT_FOLDER = "./animation";
  
	public static void main(String[] args) {
		System.out.println("Start application");
		AnimationApplication application = new AnimationApplication(ROOT_FOLDER);
		application.start();
		System.out.println("End application");
	}

}
