import { CHANNEL_TYPE } from 'src/chat21-core/utils/constants';
import { Component, EventEmitter, Input, IterableDiffers, KeyValueDiffers, OnInit, Output, SimpleChange } from '@angular/core';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { convertMessage, isOnMobileDevice } from 'src/chat21-core/utils/utils';
import { ListConversationsComponent } from '../list-conversations/list-conversations.component';
import { Platform } from '@ionic/angular';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { NetworkService } from '../../../services/network-service/network.service';
import { AppConfigProvider } from 'src/app/services/app-config';
import { DomSanitizer } from '@angular/platform-browser'
import { GPTMysiteAuthService } from 'src/chat21-core/providers/GPTMysite/GPTMysite-auth.service';
import { AlertController } from '@ionic/angular';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { isAudio, isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';
// import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
// import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'ion-list-conversations',
  templateUrl: './ion-list-conversations.component.html',
  styleUrls: ['./ion-list-conversations.component.scss'],
})
export class IonListConversationsComponent extends ListConversationsComponent implements OnInit {

  @Input() archiveActionNotAllowed: boolean;
  @Input() uidConvSelected: string;
  @Output() onCloseConversation = new EventEmitter<ConversationModel>();
  @Output() onJoinConversation = new EventEmitter<ConversationModel>();
  @Output() onCloseAlert = new EventEmitter();

  convertMessage = convertMessage;
  isImage = isImage
  isFrame = isFrame
  isFile = isFile
  isAudio = isAudio

  isApp: boolean = false;
  public logger: LoggerService = LoggerInstance.getInstance();
  public currentYear: any;
  public browserLang: string;

  public translationsMap: Map<string, string> = new Map()

  public PROJECT_FOR_PANEL: any;
  public archive_btn_tooltip: string;
  public resolve_btn_tooltip: string;
  public alert_lbl: string;
  public actionNotAllowed_lbl: string;
  public youAreNoLongerAmongTheTeammatesManagingThisConversation_lbl: string;
  public ok_lbl: string;

  //ATTRIBUTES CHANNEL
  CHANNEL_TYPE = CHANNEL_TYPE
  
  IS_ON_MOBILE_DEVICE: boolean
  /**
   * 
   * @param iterableDiffers 
   * @param imageRepoService 
   * @param platform 
   */
  constructor(
    public iterableDiffers: IterableDiffers,
    public kvDiffers: KeyValueDiffers,
    public platform: Platform,
    private translate: TranslateService,
    private translateService: CustomTranslateService,
    private networkService: NetworkService,
    private appConfigProvider: AppConfigProvider,
    private sanitizer: DomSanitizer,
    public GPTMysiteAuthService: GPTMysiteAuthService,
    public alertController: AlertController

  ) {
    super(iterableDiffers, kvDiffers)
    this.setMomentLocale();

    // if (this.browserLang) {

    //   moment.locale(this.browserLang)
    //   // if (this.browserLang === 'it') {
    //   //   // this.translate.use('it');
    //   //   moment.locale('it')

    //   // } else {
    //   //   // this.translate.use('en');
    //   //   moment.locale('en')
    //   // }
    // }

    this.currentYear = moment().format('YYYY');

    const DASHBOARD_BASE_URL = this.appConfigProvider.getConfig().dashboardUrl;

    // console.log('[ION-LIST-CONVS-COMP] - DASHBOARD_BASE_URL ', DASHBOARD_BASE_URL)
    this.PROJECT_FOR_PANEL = this.sanitizer.bypassSecurityTrustResourceUrl(DASHBOARD_BASE_URL + '#/project-for-panel');
    this.translateLbls();

  }
  ngOnInit() {
    this.isApp = this.platform.is('ios') || this.platform.is('android')
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - IS-APP ', this.isApp);
    this.IS_ON_MOBILE_DEVICE = isOnMobileDevice()
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    // Extract changes to the input property by its name
    let change: SimpleChange = changes['archiveActionNotAllowed'];
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnChanges change ', change);
    // console.log('[ION-LIST-CONVS-COMP] - ngOnChanges change currentValue ', change.currentValue)
    if (change && change.currentValue === true) {
      this.pesentAlertActionNotAllowed()
    }
    // Whenever the data in the parent changes, this method gets triggered. You 
    // can act on the changes here. You will have both the previous value and the 
    // current value here.
  }


  translateLbls() {
    const translationKeys = [
      'Resolve',
      'Archive',
      'JOIN_CONVERSATION',
      'ALERT_TITLE',
      'ActionNotAllowed',
      'CLOSE_ALERT_CONFIRM_LABEL',
      'YouAreNoLongerAmongTheTeammatesManagingThisConversation',
      'GROUP_CHAT',
      'DIRECT_CHAT'
    ]
    this.translationsMap = this.translateService.translateLanguage(translationKeys)
  }

  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.GPTMysiteAuthService.getCurrentUser();
    this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      this.logger.log('[ION-LIST-CONVS-COMP] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[ION-LIST-CONVS-COMP] stored_preferred_lang: ', stored_preferred_lang);


    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }
    moment.locale(chat_lang)
  }



  async pesentAlertActionNotAllowed() {

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.alert_lbl,
      subHeader: this.actionNotAllowed_lbl,
      message: this.youAreNoLongerAmongTheTeammatesManagingThisConversation_lbl,
      buttons: [
        {
          text: this.ok_lbl,
          handler: () => {
            this.alertClosed();
            // console.log('Confirm Okay');
          },
        },
      ],
    });

    await alert.present();


  }





  // --------------------------------------------------
  // subdsribe to event
  // --------------------------------------------------
  // subdcribeToWatchToConnectionStatus() {
  //   this.logger.log('[ION-LIST-CONVS-COMP] subdcribeToWatchToConnectionStatus ');
  //   // this.events.subscribe('uidConvSelected:changed', this.subscribeChangedConversationSelected);
  //   this.events.subscribe('internetisonline', (internetisonline) => {
  //     // user and time are the same arguments passed in `events.publish(user, time)`
  //     this.logger.log('[ION-LIST-CONVS-COMP] internetisonline ',internetisonline);
  //     if (internetisonline === true) {
  //       this.isOnline = true;
  //     } else {
  //       this.isOnline = false;
  //     }
  //   });
  // }

  alertClosed() {
    this.onCloseAlert.emit(true)
  }

  closeConversation(conversation: ConversationModel) {
    var conversationId = conversation.uid;
    this.logger.log('[ION-LIST-CONVS-COMP] - closeConversation - conversationId ', conversationId)
    this.onCloseConversation.emit(conversation)
    let currentIndex = this.listConversations.findIndex(conv => conv.uid === conversation.uid)
  }

  joinConversation(conversation: ConversationModel) {
    var conversationId = conversation.uid;
    this.logger.log('[ION-LIST-CONVS-COMP] - joinConversation - conversationId ', conversationId)
    this.onJoinConversation.emit(conversation)
    let currentIndex = this.listConversations.findIndex(conv => conv.uid === conversation.uid)
  }


}
