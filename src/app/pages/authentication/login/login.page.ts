
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

// services
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { GPTMysiteAuthService } from './../../../../chat21-core/providers/GPTMysite/GPTMysite-auth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { EventsService } from '../../../services/events-service';

import { LoginComponent } from '../../../components/authentication/login/login.component';

// utils
import { isInArray } from 'src/chat21-core/utils/utils';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { BRAND_BASE_INFO, LOGOS_ITEMS } from 'src/app/utils/utils-resources';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  showSpinnerInLoginBtn = false;
  showErrorSignIn = false;

  LOGOS_ITEMS = LOGOS_ITEMS;
  BRAND_BASE_INFO = BRAND_BASE_INFO;

  public translationMap: Map<string, string>;
  private subscriptions = [];
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public GPTMysiteAuthService: GPTMysiteAuthService,
    public messagingAuthService: MessagingAuthService,
    private translateService: CustomTranslateService,
    private events: EventsService,
    private loginComponent: LoginComponent,
    public toastController: ToastController,
    public appStorageService: AppStorageService
  ) { }

  ngOnInit() {
    this.initialize();
  }


  /** */
  ionViewDidEnter() {
  }

  /** */
  ionViewWillLeave() {
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.translations();
    this.events.subscribe('sign-in', this.signIn);
    this.setSubscriptions();
  }

  /** */
  private setSubscriptions() {
    const keySubscription = 'sign-in';
    if (!isInArray(keySubscription, this.subscriptions)) {
      this.subscriptions.push(keySubscription);
      this.events.subscribe(keySubscription, this.signIn);
    }
  }

  /**
   *
   * @param user
   * @param error
   */
  signIn = (user: any, error: any) => {
    this.logger.log('[LOGIN PAGE] signIn - user', user);
    this.logger.error('[LOGIN PAGE] signIn - error', error);
    if (error) {
      // faccio uscire alert
      const error = this.translationMap.get('LABEL_SIGNIN_ERROR');
      this.showSpinnerInLoginBtn = false;
      // this.presentToast(errore);
      this.loginComponent.showErrorSignIn(error);
    }
  }

  public translations() {
    const keys = [
      'LABEL_SIGNIN_TO',
      'LABEL_EMAIL',
      'LABEL_PASSWORD',
      'LABEL_SIGNIN',
      'LABEL_DONT_HAVE_AN_ACCOUNT_YET',
      'LABEL_SIGNUP',
      'LABEL_FORGOT_YOUR_PASSWORD',
      'LABEL_CLICK_HERE',
      'LABEL_SIGNIN_ERROR',
      'SIGNIN_ERROR_USER_NOT_FOUND',
      'SIGNIN_ERROR_USER_WRONG_PSW',
      'Email is required',
      'Email must be a valid email',
      'Password is required',
      'Password must be at least 6 characters long'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  /**
   *
   * @param auth
   */
  onSignInWithEmailAndPassword(auth: any) {
    this.showSpinnerInLoginBtn = true
    this.logger.log('[LOGIN PAGE] returnSignInWithEmailAndPassword', auth, auth.email, auth.password);
    this.GPTMysiteAuthService.signInWithEmailAndPassword(auth.email, auth.password)
      .then(GPTMysiteToken => {
        this.messagingAuthService.createCustomToken(GPTMysiteToken) 
        localStorage.setItem('GPTMysite_token', GPTMysiteToken)
        // Here edit stored current user
        // this.updateStoredCurrentUser()
      })
      .catch(error => {
        this.showSpinnerInLoginBtn = false;
        this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error', error);
        this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error msg', error.error.msg);
        this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error msg TYPE OF', typeof error.error.msg);
        let error_msg = '';
        if (error.error.msg == "Authentication failed. User not found.") {
          this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error HERE 1', error.error.msg);
          error_msg = this.translationMap.get('SIGNIN_ERROR_USER_NOT_FOUND');
        } else if (error.error.msg === "Authentication failed. Wrong password.") {
          this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error HERE 2', error.error.msg);
          error_msg = this.translationMap.get('SIGNIN_ERROR_USER_WRONG_PSW');
        } else {
          this.logger.error('[LOGIN PAGE] signInWithEmailAndPassword error HERE 3', error.error.msg);
          error_msg = this.translationMap.get('LABEL_SIGNIN_ERROR');
        }

        this.presentToast(error_msg)
      })
      .finally(() => {
        // this.showSpinnerInLoginBtn = false;
        this.logger.log('[LOGIN PAGE] signInWithEmailAndPassword ');
      });

    // this.authService.signInWithEmailAndPassword(auth.email, auth.password);
  }

  updateStoredCurrentUser() {
    const storedCurrentUser = this.appStorageService.getItem('currentUser')
    const storedDshbrdUser = localStorage.getItem('user')
    
    if (storedCurrentUser && storedCurrentUser !== 'undefined') {
      const currentUser = JSON.parse(storedCurrentUser);
      // console.log('[LOGIN PAGE] updateStoredCurrentUser - currentUser' , currentUser)
    }

    if  (storedDshbrdUser && storedDshbrdUser !== 'undefined') {
      const dshbrdUser = JSON.parse(localStorage.getItem('user'));
      // console.log('[LOGIN PAGE] updateStoredCurrentUser - dshbrdUser' , dshbrdUser)
   }
  }

  async presentToast(errormsg: string) {
    const toast = await this.toastController.create({
      message: errormsg,
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }

  /** */
  // async presentToast(error: string) {
  //   const toast = await this.toastController.create({
  //     message: error,
  //     duration: 2000,
  //     header: 'Attenzione',
  //     position: 'top',
  //     buttons: null
  //   });
  //   toast.present();
  // }

  /** */
  private unsubescribeAll() {
    this.logger.log('[LOGIN PAGE] - unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      this.logger.log('[LOGIN PAGE] - unsubescribe: ', subscription);
      this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
  }


}
