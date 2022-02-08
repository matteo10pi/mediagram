import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthenticatorComponent } from './tools/authenticator/authenticator.component';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'mediagram';
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();
  userHasProfile = true;
  private static userDocument: UserDocument; /* per accedervi creo una funzione getUserDocument*/

  constructor(private loginsheet: MatBottomSheet, private router: Router) {
    this.auth.listenToSignInStateChanges((user) => {
      this.auth.checkSignInState({
        whenSignedIn: (user) => {},
        whenSignedOut: (user) => {
          AppComponent.userDocument = {
            publicName: '',
            description: '',
            userId: '',
          };
        },
        whenSignedInAndEmailNotVerified: (user) => {
          this.router.navigate(['emailVerification']);
        },
        whenSignedInAndEmailVerified: (user) => {
          this.getUserProfile();
        },
        whenChanged: (user) => {},
      });
    });
  }
  public static getUserDocument() {
    return AppComponent.userDocument;
  }
  getUsername(): any {
    try {
      return AppComponent.userDocument.publicName;
    } catch (err) {}
  }
  getUserProfile() {
    this.firestore.listenToDocument({
      name: 'Getting Document',
      path: ['Users', this.auth.getAuth().currentUser!.uid],
      onUpdate: (result) => {
        AppComponent.userDocument = <UserDocument>result.data();
        this.userHasProfile = result.exists;
        AppComponent.userDocument.userId = this.auth.getAuth().currentUser!.uid;
        if (this.userHasProfile) {
          this.router.navigate(['postfeed']);
        }
      },
    });
  }
  onLogoutClick() {
    this.auth.signOut();
  }
  loggedIn() {
    return this.auth.isSignedIn();
  }
  onLoginClick() {
    this.loginsheet.open(AuthenticatorComponent);
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
  userId: string;
}
