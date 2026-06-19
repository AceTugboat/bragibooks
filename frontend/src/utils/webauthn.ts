function base64urlToUint8Array(b64url: string): Uint8Array {
    const padded = b64url.replace(/-/g, '+').replace(/_/g, '/')
        + '=='.slice(0, (4 - b64url.length % 4) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function uint8ArrayToBase64url(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function startRegistration(options: any, name: string): Promise<any> {
    const publicKey: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToUint8Array(options.challenge),
        user: {
            ...options.user,
            id: base64urlToUint8Array(options.user.id),
        },
        excludeCredentials: (options.excludeCredentials ?? []).map((c: any) => ({
            ...c,
            id: base64urlToUint8Array(c.id),
        })),
    };

    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    const attestation = credential.response as AuthenticatorAttestationResponse;

    return {
        id: credential.id,
        rawId: uint8ArrayToBase64url(credential.rawId),
        type: credential.type,
        name,
        response: {
            clientDataJSON: uint8ArrayToBase64url(attestation.clientDataJSON),
            attestationObject: uint8ArrayToBase64url(attestation.attestationObject),
        },
    };
}

export async function startAuthentication(options: any): Promise<any> {
    const publicKey: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64urlToUint8Array(options.challenge),
        allowCredentials: (options.allowCredentials ?? []).map((c: any) => ({
            ...c,
            id: base64urlToUint8Array(c.id),
        })),
    };

    const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
    const assertionResp = assertion.response as AuthenticatorAssertionResponse;

    return {
        id: assertion.id,
        rawId: uint8ArrayToBase64url(assertion.rawId),
        type: assertion.type,
        response: {
            clientDataJSON: uint8ArrayToBase64url(assertionResp.clientDataJSON),
            authenticatorData: uint8ArrayToBase64url(assertionResp.authenticatorData),
            signature: uint8ArrayToBase64url(assertionResp.signature),
            userHandle: assertionResp.userHandle
                ? uint8ArrayToBase64url(assertionResp.userHandle)
                : null,
        },
    };
}
