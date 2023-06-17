import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    @Output() onLogin = new EventEmitter<boolean>();

    loginState: boolean = false;
    loginForm: FormGroup;
    registerForm: FormGroup;

    @ViewChild('message') message: ElementRef;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit() {
        this.loginForm = new FormGroup({
            loginPassword: new FormControl('', [Validators.required])
        });

        this.registerForm = new FormGroup({
            password: new FormControl('', [Validators.required]),
            confirmPassword: new FormControl('', [Validators.required])
        });
    }

    ngAfterViewInit(): void {
        this.messageService.sendMessage(
            {
                task: TASKS.AUTHENTICATE
            },
            (result) => {
                if (result) {
                    this.loginState = true;

                    this.messageService.sendMessage(
                        {
                            task: TASKS.CHECK_LOGIN
                        },
                        (result) => {
                            if (result) {
                                this.onLogin.emit(true);
                            }

                            this.changeDetector.detectChanges();
                        }
                    );
                }
            }
        );
    }

    login() {
        let pwd: any = this.loginForm.get('loginPassword').value;

        if (pwd.length != 0) {
            this.messageService.sendMessage(
                {
                    task: TASKS.LOGIN,
                    password: pwd
                },
                (result) => {
                    if (result) {
                        localStorage.setItem('new-content', 'true');
                        this.onLogin.emit(true);
                    } else {
                        this.message.nativeElement.textContent = 'Invalid password';
                    }
                }
            );
        } else {
            this.message.nativeElement.textContent = 'Please enter the password';
        }

        setTimeout(() => {
            if (this.message) this.message.nativeElement.textContent = '';
        }, 2000);
    }

    register() {
        let pwd1: any = this.registerForm.get('password').value;
        let pwd2: any = this.registerForm.get('confirmPassword').value;

        if (pwd1.length != 0) {
            if (pwd2.length != 0) {
                if (pwd1 == pwd2) {
                    this.messageService.sendMessage(
                        {
                            task: TASKS.REGISTER,
                            password: pwd1
                        },
                        (result) => {
                            if (result) {
                                this.loginState = true;
                                this.changeDetector.detectChanges();
                            }
                        }
                    );
                } else {
                    this.message.nativeElement.textContent = 'Invalid password';
                }
            } else {
                this.message.nativeElement.textContent = 'Please confirm new password';
            }
        } else {
            this.message.nativeElement.textContent = 'Please enter new password';
        }

        setTimeout(() => {
            if (this.message) this.message.nativeElement.textContent = '';
        }, 2000);
    }
}
