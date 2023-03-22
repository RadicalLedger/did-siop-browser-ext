export default {
    vc: (vc: any) => {
        return {
            id: vc?.id,
            issuanceDate: vc?.issuanceDate,
            issuer: vc?.issuer,
            proof: vc?.proof,
            type: vc?.credentialSubject?.type,
            holder: vc?.credentialSubject?.holder,
            title: vc?.credentialSubject?.title,
            description: vc?.credentialSubject?.description,
            issuerLogo: vc?.credentialSubject?.issuerLogo,
            issuerName: vc?.credentialSubject?.issuerName,
            issuerUrl: vc?.credentialSubject?.issuerUrl,
            holderImage: vc?.credentialSubject?.holderImage,
            holderName: vc?.credentialSubject?.holderName,
            holderProfileUrl: vc?.credentialSubject?.holderProfileUrl,
            remarks: vc?.credentialSubject?.remarks,
            visualPresentation: vc?.credentialSubject?.visualPresentation,
            customAttribute: vc?.credentialSubject?.customAttribute
        };
    }
};
