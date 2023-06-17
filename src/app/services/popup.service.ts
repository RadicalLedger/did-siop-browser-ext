/*global browser*/
import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

@Injectable({
    providedIn: 'root'
})
export class PopupService {
    constructor() {}

    show(options: SweetAlertOptions = {}): Promise<SweetAlertResult> {
        return new Promise((resolve, reject) => {
            if (
                (options.showConfirmButton || options.confirmButtonText) &&
                !options?.confirmButtonColor
            )
                options.confirmButtonColor = '#24c3b5';

            Swal.fire(options)
                .then((result) => resolve(result))
                .catch((error) => reject(error));
        });
    }
}
