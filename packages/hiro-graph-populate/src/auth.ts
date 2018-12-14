import chalk from "chalk";
import fetch from "node-fetch";
import Ora from "ora";

import { configsSingleton } from "./config";

type AuthAccountType = "person" | "application";

interface IResponse {
    error?: { message: string };
}

interface ICreateAccount {
    "ogit/name": string;
    "ogit/email"?: string;
    "ogit/Auth/Account/type": AuthAccountType;
    "ogit/_organization": string;
}

type IActivateAccountResponse = IAccount & IResponse;

type IUpdateProfileResponse = IProfile & IResponse;

export interface ICreateAccountResponse {
    account: IAccount;
    profile: IProfile;
    error?: { message: string };
}

// Generated by https://quicktype.io

export interface IProfile {
    "ogit/_created-on": number;
    "ogit/_organization": string;
    "ogit/_modified-on": number;
    "ogit/_id": string;
    "ogit/_creator": string;
    "ogit/_graphtype": string;
    "ogit/_owner": string;
    "ogit/_v-id": string;
    "ogit/_v": number;
    "ogit/Auth/Account/displayName": string;
    "ogit/_modified-by-app": string;
    "ogit/_is-deleted": boolean;
    "ogit/_creator-app": string;
    "ogit/_modified-by": string;
    "ogit/_scope": string;
    "ogit/_type": string;
}

export interface IAccount {
    "ogit/_created-on": number;
    "ogit/_xid"?: string;
    "ogit/_organization": string;
    "ogit/name"?: string;
    "ogit/status"?: string;
    "ogit/_modified-on": number;
    "ogit/_id": string;
    "ogit/_creator": string;
    "ogit/_graphtype": string;
    "ogit/_owner": string;
    "ogit/_v-id": string;
    "ogit/_v": number;
    "ogit/Auth/Account/type"?: string;
    "ogit/_modified-by-app": string;
    "ogit/_is-deleted": boolean;
    "ogit/_creator-app": string;
    "ogit/_modified-by": string;
    "ogit/_scope": string;
    "ogit/_type": string;
    "ogit/Auth/Account/displayName"?: string;
}

// Generated by https://quicktype.io

export interface ICreateOrganizationResponse extends IResponse {
    "ogit/_xid": string;
    "ogit/_organization": string;
    "ogit/_created-on": number;
    "ogit/name": string;
    "ogit/_modified-on": number;
    "ogit/_id": string;
    "ogit/_creator": string;
    "ogit/_graphtype": string;
    "ogit/_owner": string;
    "ogit/_is-deleted": boolean;
    "ogit/_scope": string;
    "ogit/_type": string;
}

// Generated by https://quicktype.io

export interface IOrganizationTeamsResponse extends IResponse {
    items: ITeam[];
}

export interface ITeam {
    "ogit/_created-on": number;
    "ogit/_xid": string;
    "ogit/_organization": string;
    "ogit/name": string;
    "ogit/_modified-on": number;
    "ogit/_id": string;
    "ogit/_creator": string;
    "ogit/description": string;
    "ogit/_graphtype": string;
    "ogit/_owner": string;
    "ogit/_v-id": string;
    "ogit/_v": number;
    "ogit/_is-deleted": boolean;
    "ogit/_scope": string;
    "ogit/_type": string;
}

export interface IAddMembersResponse {
    "ogit/_created-on": number;
    "ogit/_xid": string;
    "ogit/_organization": string;
    "ogit/name": string;
    "ogit/status": string;
    "ogit/_modified-on": number;
    "ogit/_id": string;
    "ogit/_creator": string;
    "ogit/_graphtype": string;
    "ogit/email": string;
    "ogit/_owner": string;
    "ogit/_v-id": string;
    "ogit/_v": number;
    "ogit/Auth/Account/type": string;
    "ogit/_modified-by-app": string;
    "ogit/_is-deleted": boolean;
    "ogit/_creator-app": string;
    "ogit/_modified-by": string;
    "ogit/_scope": string;
    "ogit/_type": string;
}

const helpers = (token: string, url: string) => ({
    createAccount: (body: ICreateAccount) =>
        fetch(`${url}/api/6.1/iam/accounts/`, {
            body: JSON.stringify(body),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "POST"
        }).then<ICreateAccountResponse>(res => res.json()),

    activateAccount: (id: string) =>
        fetch(`${url}/api/6.1/iam/accounts/${id}`, {
            body: JSON.stringify({}),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "PATCH"
        }).then<IActivateAccountResponse>(res => res.json()),

    updateAccountProfile: (id: string, data: object) =>
        fetch(`${url}/api/6.1/iam/accounts/profile/${id}`, {
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "POST"
        }).then<IUpdateProfileResponse>(res => res.json()),

    setPassword: (id: string, password: string) =>
        fetch(`${url}/api/6.1/iam/accounts/${id}/password`, {
            body: JSON.stringify({ password }),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "PUT"
        }).then(res => res.json()),

    createOrganization: (name: string) =>
        fetch(`${url}/api/6.1/iam/organization/`, {
            body: JSON.stringify({ "ogit/name": name }),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "POST"
        }).then<ICreateOrganizationResponse>(res => res.json()),

    organizationTeams: (id: string) =>
        fetch(`${url}/api/6.1/iam/organization/${id}/teams`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then<IOrganizationTeamsResponse>(res => res.json())
            .then(res => res.items),

    addMembers: (id: string, members: string[]) =>
        fetch(`${url}/api/6.1/iam/team/${id}/members/add`, {
            body: JSON.stringify({ accounts: members.join(",") }),
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "POST"
        }).then<IAddMembersResponse[] | IResponse>(res => res.json())
});

export const createOrg = async (token: string, name: string) => {
    const configs = await configsSingleton;

    if (!configs) {
        return;
    }

    const { createOrganization, organizationTeams, addMembers } = helpers(
        token,
        configs.env.HIRO_GRAPH_URL
    );

    let o = new Ora(`Creating organization ${chalk.blue(name)}`).start();
    try {
        const resCreate = await createOrganization(name);

        if (resCreate.error) {
            console.warn(resCreate.error);
            throw new Error(resCreate.error.message);
        }

        o.succeed(
            `Created organization ${chalk.blue(name)}: ${resCreate["ogit/_id"]}`
        );

        o = new Ora(`Getting teams for '${resCreate["ogit/_id"]}'`);
        const resTeams = await organizationTeams(resCreate["ogit/_id"]);

        o.succeed(
            `Teams [${resTeams.length}]: [${resTeams
                .map(m => `${chalk.blue(m["ogit/name"])}: ${m["ogit/_id"]}`)
                .join(", ")}]`
        );

        const addAdmins = async (admins: string[]) => {
            if (admins && admins.length > 0) {
                o = new Ora(`Adding admins`);
                const adminTeam = resTeams
                    .filter(t => t["ogit/name"] === "admin")
                    .pop();

                if (!adminTeam) {
                    throw new Error(
                        `Team named 'admin' not found for org '${name}'`
                    );
                }

                const resAddMem = await addMembers(
                    adminTeam["ogit/_id"],
                    admins
                );
                const error = (resAddMem as IResponse).error;

                if (error) {
                    throw new Error(error.message);
                }

                o.succeed(`Added admins`);
            }
        };

        return {
            addAdmins,
            org: resCreate,
            teams: resTeams
        };
    } catch (err) {
        o.fail(err);
    }
};

export const createUser = async (token: string, user: IPerson, org: string) => {
    const configs = await configsSingleton;

    if (!configs) {
        return;
    }

    const {
        createAccount,
        activateAccount,
        updateAccountProfile,
        setPassword
    } = helpers(token, configs.env.HIRO_GRAPH_URL);

    let o = new Ora(`Creating account '${user.email}'`).start();
    try {
        const resCreate = await createAccount({
            "ogit/Auth/Account/type": user.email ? "person" : "application",
            "ogit/_organization": org,
            "ogit/email": user.email,
            "ogit/name": user.email
        });

        if (resCreate.error) {
            throw new Error(resCreate.error.message);
        }

        o.succeed(
            `Created account [${chalk.blue("account")}: ${
                resCreate.account["ogit/_id"]
            }, ${chalk.blue("profile")}: ${resCreate.profile["ogit/_id"]}]`
        );

        o = new Ora(`Activating account '${resCreate.account["ogit/_id"]}'`);

        const resActivate = await activateAccount(
            resCreate.account["ogit/_id"]
        );

        if (resActivate.error) {
            throw new Error(resActivate.error.message);
        }

        o.succeed(`Activated account: ${resActivate["ogit/_id"]}`);

        o = new Ora(
            `Updating account profile '${resCreate.profile["ogit/_id"]}'`
        );
        const resProfile = await updateAccountProfile(
            resCreate.profile["ogit/_id"],
            {
                "ogit/Auth/Account/displayName": user.name
            }
        );

        if (resProfile.error) {
            throw new Error(resProfile.error.message);
        }

        o.succeed(`Updated account profile: ${resCreate.profile["ogit/_id"]}`);

        o = new Ora(
            `Setting password for account '${resActivate["ogit/_id"]}'`
        );
        await setPassword(resActivate["ogit/_id"], user.password);
        o.succeed("Password set");

        return {
            account: resActivate,
            profile: resCreate.profile
        };
    } catch (err) {
        o.fail(err);
    }
};
