const request = require('supertest');

// Mock bcrypt to avoid native binding issues
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

// Mock services
jest.mock('../src/services/guestService');
jest.mock('../src/services/govBridgeService');
jest.mock('../src/middleware/authMiddleware', () => ({
    requireAuth: (req, res, next) => {
        req.authenticatedHost = { id: 1, email: 'test@host.com' };
        next();
    }
}));

const app = require('../src/app');

const GuestService = require('../src/services/guestService');
const GovBridgeService = require('../src/services/govBridgeService');

describe('Guest API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/guests returns list of guests', async () => {
        const mockGuests = [{ id: 1, firstName: 'John' }];
        GuestService.getGuestsByHostId.mockResolvedValue(mockGuests);

        const res = await request(app).get('/api/guests');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.guests).toEqual(mockGuests);
        expect(GuestService.getGuestsByHostId).toHaveBeenCalledWith(1);
    });

    test('POST /api/guests/save creates a guest', async () => {
        const newGuest = { firstName: 'Jane', lastName: 'Doe' };
        const savedGuest = { ...newGuest, id: 2 };
        GuestService.createGuest.mockResolvedValue(savedGuest);

        const res = await request(app)
            .post('/api/guests/save')
            .send(newGuest);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.guest).toEqual(savedGuest);
        expect(GuestService.createGuest).toHaveBeenCalledWith(1, newGuest);
    });
});
