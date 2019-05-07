import AuthService from "../../services/AuthService";
import { AuthRoles } from "../../interfaces/AuthRoles";

describe('AuthService', () => {
    it('should allow everything to admin', () => {
        return AuthService.isAuthorized([AuthRoles.ADMIN], AuthRoles.BILLINGREPORTS_CREATE)
    })

    it('should block if no access', () => {
        return !AuthService.isAuthorized([AuthRoles.MEMBERS_READ], AuthRoles.MEMBERS_EDIT)
    })

    it('it should allow', () => {
        return AuthService.isAuthorized([AuthRoles.MEMBERS_EDIT], AuthRoles.MEMBERS_EDIT)
    })
})