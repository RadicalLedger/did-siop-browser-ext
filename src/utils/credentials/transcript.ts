export default {
    vc: (vc: any) => {
        return {
            id: vc?.id,
            issuanceDate: vc?.issuanceDate,
            issuer: vc?.issuer,
            proof: vc?.proof,
            type: vc?.credentialSubject?.achievementInfo?.type,
            holder: vc?.credentialSubject?.achievementInfo?.holder,
            title: vc?.credentialSubject?.achievementInfo?.title,
            conductedBy: vc?.credentialSubject?.achievementInfo?.conductedBy,
            signature: vc?.credentialSubject?.achievementInfo?.signature,
            description: vc?.credentialSubject?.achievementInfo?.description,
            issuerLogo: vc?.credentialSubject?.achievementInfo?.issuerLogo,
            issuerName: vc?.credentialSubject?.achievementInfo?.issuerName,
            issuerUrl: vc?.credentialSubject?.achievementInfo?.issuerUrl,
            holderImage: vc?.credentialSubject?.achievementInfo?.holderImage,
            holderName: vc?.credentialSubject?.achievementInfo?.holderName,
            holderProfileUrl: vc?.credentialSubject?.achievementInfo?.holderProfileUrl,
            remarks: vc?.credentialSubject?.achievementInfo?.remarks,
            visualPresentation: vc?.credentialSubject?.achievementInfo?.visualPresentation,
            subject: vc?.credentialSubject?.subject,
            customAttribute: vc?.credentialSubject?.customAttribute
        };
    }
};
